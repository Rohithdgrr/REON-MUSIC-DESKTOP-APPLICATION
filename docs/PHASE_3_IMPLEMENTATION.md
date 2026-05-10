# Phase 3: Discovery & Smart Features Implementation

## 🎯 Overview
Phase 3 focuses on music discovery and intelligent features to enhance user experience.

**Features** (Adapted for standalone app):
1. ⏳ Smart Playlists - Auto-generated based on rules
2. ⏳ Recently Played - Quick access to recent songs
3. ⏳ Most Played - Top songs and artists
4. ⏳ Favorites System - Mark and organize favorites
5. ⏳ Song Radio - Generate similar songs

**Estimated Time**: 2-3 weeks  
**Priority**: High  
**Dependencies**: SQLite database, Innertube API

---

## 1. Smart Playlists ⏳

### Overview
Auto-generated playlists based on user-defined rules and listening patterns.

### Implementation

#### File: `src/stores/smartPlaylists.js`
```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSmartPlaylistsStore = defineStore('smartPlaylists', () => {
  const smartPlaylists = ref([
    {
      id: 'recently-added',
      name: 'Recently Added',
      icon: 'new',
      rule: { type: 'recentlyAdded', days: 7 },
      auto: true
    },
    {
      id: 'most-played',
      name: 'Most Played',
      icon: 'trending',
      rule: { type: 'mostPlayed', limit: 50 },
      auto: true
    },
    {
      id: 'favorites',
      name: 'Favorites',
      icon: 'heart',
      rule: { type: 'favorites' },
      auto: true
    },
    {
      id: 'long-songs',
      name: 'Long Songs (5+ min)',
      icon: 'time',
      rule: { type: 'duration', min: 300 },
      auto: true
    }
  ])
  
  async function generatePlaylist(rule) {
    // Query database based on rule
    // Return matching songs
  }
  
  return {
    smartPlaylists,
    generatePlaylist
  }
})
```

#### File: `src/components/SmartPlaylistCard.vue`
```vue
<template>
  <div class="smart-playlist-card" @click="openPlaylist">
    <div class="card-icon">
      <svg><!-- dynamic icon --></svg>
    </div>
    <div class="card-info">
      <h4>{{ playlist.name }}</h4>
      <p>{{ songCount }} songs</p>
    </div>
    <div class="auto-badge">Auto</div>
  </div>
</template>
```

### Features
- Recently Added (last 7 days)
- Most Played (top 50)
- Favorites
- Long Songs (5+ minutes)
- Short Songs (< 3 minutes)
- Custom rules (user-defined)

---

## 2. Recently Played ⏳

### Overview
Quick access to recently played songs with timestamps.

### Implementation

#### File: `src/views/RecentlyPlayedView.vue`
```vue
<template>
  <div class="recently-played-view">
    <div class="view-header">
      <h1>Recently Played</h1>
      <button @click="clearHistory">Clear History</button>
    </div>
    
    <div class="timeline">
      <div v-for="group in groupedHistory" :key="group.date" class="timeline-group">
        <h3 class="timeline-date">{{ group.date }}</h3>
        <div class="timeline-songs">
          <TrackCard
            v-for="track in group.songs"
            :key="track.id"
            :track="track"
            :showTime="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getElectronApi } from '../utils/electronApi.js'

const groupedHistory = ref([])

async function loadHistory() {
  const electron = getElectronApi()
  const result = await electron.sqlite.getHistory()
  
  if (result.success) {
    // Group by date (Today, Yesterday, This Week, etc.)
    groupedHistory.value = groupByDate(result.data)
  }
}

function groupByDate(history) {
  const groups = {}
  const now = new Date()
  
  history.forEach(item => {
    const date = new Date(item.playedAt)
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    let label
    if (diff === 0) label = 'Today'
    else if (diff === 1) label = 'Yesterday'
    else if (diff < 7) label = 'This Week'
    else if (diff < 30) label = 'This Month'
    else label = date.toLocaleDateString()
    
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  })
  
  return Object.entries(groups).map(([date, songs]) => ({ date, songs }))
}

onMounted(loadHistory)
</script>
```

### Features
- Grouped by time (Today, Yesterday, This Week, etc.)
- Show play time for each song
- Clear history option
- Infinite scroll for old history
- Play from history

---

## 3. Most Played ⏳

### Overview
Statistics and insights about listening habits.

### Implementation

#### File: `src/views/StatsView.vue`
```vue
<template>
  <div class="stats-view">
    <h1>Your Stats</h1>
    
    <!-- Overview Cards -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">🎵</div>
        <div class="stat-value">{{ totalSongs }}</div>
        <div class="stat-label">Total Songs</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">{{ totalTime }}</div>
        <div class="stat-label">Hours Listened</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎤</div>
        <div class="stat-value">{{ totalArtists }}</div>
        <div class="stat-label">Artists</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📀</div>
        <div class="stat-value">{{ totalPlaylists }}</div>
        <div class="stat-label">Playlists</div>
      </div>
    </div>
    
    <!-- Top Songs -->
    <section class="stats-section">
      <h2>Most Played Songs</h2>
      <div class="top-list">
        <div v-for="(song, index) in topSongs" :key="song.id" class="top-item">
          <span class="rank">{{ index + 1 }}</span>
          <img :src="song.thumbnail" class="item-thumb" />
          <div class="item-info">
            <div class="item-title">{{ song.title }}</div>
            <div class="item-artist">{{ song.artist }}</div>
          </div>
          <div class="play-count">{{ song.playCount }} plays</div>
        </div>
      </div>
    </section>
    
    <!-- Top Artists -->
    <section class="stats-section">
      <h2>Top Artists</h2>
      <div class="artist-grid">
        <div v-for="artist in topArtists" :key="artist.name" class="artist-card">
          <div class="artist-name">{{ artist.name }}</div>
          <div class="artist-plays">{{ artist.playCount }} plays</div>
        </div>
      </div>
    </section>
  </div>
</template>
```

### Features
- Total songs, listening time, artists, playlists
- Top 50 most played songs
- Top 20 artists
- Listening trends (daily, weekly, monthly)
- Genre breakdown
- Time of day analysis

---

## 4. Favorites System ⏳

### Overview
Mark songs, artists, and playlists as favorites for quick access.

### Implementation

#### Database Migration: `electron/main/db/migrations/002_favorites.sql`
```sql
-- Add favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE(song_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_added_at ON favorites(added_at);
```

#### File: `src/stores/favorites.js`
```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getElectronApi } from '../utils/electronApi.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(new Set())
  
  async function loadFavorites() {
    const electron = getElectronApi()
    const result = await electron.sqlite.getFavorites()
    
    if (result.success) {
      favorites.value = new Set(result.data.map(f => f.song_id))
    }
  }
  
  async function toggleFavorite(songId) {
    const electron = getElectronApi()
    
    if (favorites.value.has(songId)) {
      await electron.sqlite.removeFavorite(songId)
      favorites.value.delete(songId)
    } else {
      await electron.sqlite.addFavorite(songId)
      favorites.value.add(songId)
    }
  }
  
  function isFavorite(songId) {
    return favorites.value.has(songId)
  }
  
  return {
    favorites,
    loadFavorites,
    toggleFavorite,
    isFavorite
  }
})
```

#### Update: `src/components/TrackCard.vue`
```vue
<button @click.stop="toggleFavorite" class="favorite-btn">
  <svg v-if="isFavorite" fill="currentColor">
    <!-- filled heart -->
  </svg>
  <svg v-else>
    <!-- outline heart -->
  </svg>
</button>
```

### Features
- Heart icon on all track cards
- Favorites playlist (auto-generated)
- Quick toggle favorite
- Favorites count badge
- Sort by date added

---

## 5. Song Radio ⏳

### Overview
Generate a playlist of similar songs based on a seed song.

### Implementation

#### File: `src/services/RadioService.js`
```javascript
export class RadioService {
  async generateRadio(seedSong) {
    // Use Innertube API to get related songs
    const queries = [
      `${seedSong.artist} similar songs`,
      `songs like ${seedSong.title}`,
      `${seedSong.artist} radio`,
      `${extractGenre(seedSong.title)} music`
    ]
    
    const allSongs = []
    
    for (const query of queries) {
      const results = await searchSongs(query, 10)
      allSongs.push(...results)
    }
    
    // Remove duplicates and seed song
    const unique = removeDuplicates(allSongs)
    const filtered = unique.filter(s => s.videoId !== seedSong.videoId)
    
    // Shuffle and limit
    return shuffle(filtered).slice(0, 50)
  }
  
  function extractGenre(title) {
    // Simple genre extraction from title
    const genres = ['rock', 'pop', 'jazz', 'classical', 'hip hop', 'electronic']
    for (const genre of genres) {
      if (title.toLowerCase().includes(genre)) {
        return genre
      }
    }
    return 'music'
  }
}
```

#### File: `src/components/RadioButton.vue`
```vue
<template>
  <button @click="startRadio" class="radio-btn" title="Start Radio">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/>
    </svg>
    <span>Start Radio</span>
  </button>
</template>

<script setup>
import { usePlayerStore } from '../stores/player.js'
import { RadioService } from '../services/RadioService.js'

const props = defineProps({
  song: Object
})

const player = usePlayerStore()
const radioService = new RadioService()

async function startRadio() {
  const songs = await radioService.generateRadio(props.song)
  player.setQueue([props.song, ...songs], 0)
  player.playTrack(props.song)
}
</script>
```

### Features
- Start radio from any song
- Generate 50 similar songs
- Mix of artist songs and similar artists
- Infinite radio (auto-add more when queue low)
- Radio history

---

## 📦 Database Updates

### New Tables

```sql
-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE(song_id)
);

-- Play counts (for statistics)
CREATE TABLE IF NOT EXISTS play_counts (
  song_id INTEGER PRIMARY KEY,
  play_count INTEGER DEFAULT 0,
  last_played DATETIME,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Smart playlist rules
CREATE TABLE IF NOT EXISTS smart_playlist_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  rule_params TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### New IPC Handlers

```javascript
// electron/main/ipc/sqlite.js

// Favorites
ipcMain.handle('sqlite:getFavorites', async () => {
  // Return all favorites with song details
})

ipcMain.handle('sqlite:addFavorite', async (event, songId) => {
  // Add song to favorites
})

ipcMain.handle('sqlite:removeFavorite', async (event, songId) => {
  // Remove song from favorites
})

// Statistics
ipcMain.handle('sqlite:getStats', async () => {
  // Return listening statistics
})

ipcMain.handle('sqlite:getTopSongs', async (event, limit) => {
  // Return most played songs
})

ipcMain.handle('sqlite:getTopArtists', async (event, limit) => {
  // Return most played artists
})
```

---

## 🎨 UI Components

### New Views
1. `src/views/RecentlyPlayedView.vue` - Recently played timeline
2. `src/views/StatsView.vue` - Listening statistics
3. `src/views/FavoritesView.vue` - All favorites
4. `src/views/SmartPlaylistView.vue` - Smart playlist details

### New Components
1. `src/components/SmartPlaylistCard.vue` - Smart playlist card
2. `src/components/RadioButton.vue` - Start radio button
3. `src/components/FavoriteButton.vue` - Favorite toggle button
4. `src/components/StatCard.vue` - Statistics card

### Sidebar Updates
Add navigation items:
- Recently Played
- Favorites
- Stats
- Smart Playlists

---

## 🧪 Testing Checklist

### Smart Playlists
- [ ] Recently Added shows last 7 days
- [ ] Most Played shows top 50
- [ ] Favorites shows all favorites
- [ ] Long Songs filters correctly
- [ ] Custom rules work
- [ ] Auto-update on changes

### Recently Played
- [ ] Groups by date correctly
- [ ] Shows play time
- [ ] Clear history works
- [ ] Infinite scroll works
- [ ] Play from history works

### Statistics
- [ ] Total counts accurate
- [ ] Top songs correct
- [ ] Top artists correct
- [ ] Listening time calculated
- [ ] Charts display properly

### Favorites
- [ ] Toggle favorite works
- [ ] Heart icon updates
- [ ] Favorites persist
- [ ] Favorites view shows all
- [ ] Remove from favorites works

### Song Radio
- [ ] Generates similar songs
- [ ] Starts playing immediately
- [ ] Queue populated
- [ ] No duplicates
- [ ] Variety in results

---

## 🚀 Implementation Order

1. **Favorites System** (Easiest, 4-6 hours)
   - Database migration
   - IPC handlers
   - Favorites store
   - UI integration
   - Testing

2. **Recently Played** (Easy, 3-4 hours)
   - View component
   - Date grouping logic
   - Clear history
   - Testing

3. **Statistics** (Medium, 6-8 hours)
   - Database queries
   - Stats calculations
   - View component
   - Charts/visualizations
   - Testing

4. **Smart Playlists** (Medium, 6-8 hours)
   - Smart playlist store
   - Rule engine
   - Auto-generation logic
   - UI components
   - Testing

5. **Song Radio** (Hard, 8-10 hours)
   - Radio service
   - Similar song algorithm
   - Queue management
   - Infinite radio
   - Testing

**Total Estimated Time**: 27-36 hours

---

## 📊 Success Criteria

### Favorites System
✅ Can mark/unmark favorites  
✅ Favorites persist across sessions  
✅ Favorites view shows all  
✅ Heart icon updates immediately

### Recently Played
✅ Shows recent history  
✅ Grouped by time periods  
✅ Can clear history  
✅ Can play from history

### Statistics
✅ Accurate play counts  
✅ Top songs/artists correct  
✅ Listening time calculated  
✅ Visual charts display

### Smart Playlists
✅ Auto-generate based on rules  
✅ Update automatically  
✅ Multiple rule types work  
✅ Custom rules supported

### Song Radio
✅ Generates similar songs  
✅ Good variety  
✅ No duplicates  
✅ Starts playing immediately  
✅ Infinite radio works

---

This document provides the complete implementation plan for Phase 3! 🎵✨
