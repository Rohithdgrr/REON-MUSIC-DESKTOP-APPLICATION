<template>
  <div class="library-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Your Library</h1>
        <p class="page-subtitle">{{ totalSongs }} songs • {{ totalArtists }} artists</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="filter-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div v-if="library.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your library...</p>
    </div>

    <div v-else>
      <!-- All Songs -->
      <div v-if="activeTab === 'songs'" class="section">
        <div class="section-header">
          <span class="count">{{ library.songs.length }} songs</span>
        </div>
        <div v-if="library.songs.length === 0" class="empty-text">
          No saved songs yet. Start listening to build your library!
        </div>
        <div v-else class="track-list-scrollable">
          <RecycleScroller
            :items="library.songs"
            :item-size="72"
            key-field="id"
            class="scroller"
            v-slot="{ item }"
          >
            <TrackCard :track="normalizeSong(item)" @play="handlePlay" />
          </RecycleScroller>
        </div>
      </div>

      <!-- Most Listened -->
      <div v-if="activeTab === 'most-listened'" class="section">
        <div class="section-header">
          <h2 class="section-title">Most Listened</h2>
          <span class="count">{{ topSongs.length }} songs</span>
        </div>
        <div v-if="topSongs.length === 0" class="empty-text">
          No listening data yet. Play some songs to see your top tracks!
        </div>
        <div v-else class="track-list-scrollable">
          <RecycleScroller
            :items="topSongs"
            :item-size="72"
            key-field="id"
            class="scroller"
            v-slot="{ item, index }"
          >
            <div class="track-row">
              <span class="track-rank">{{ index + 1 }}</span>
              <TrackCard :track="normalizeSong(item)" @play="handlePlay" />
              <span class="play-count">{{ item.playCount }} plays</span>
            </div>
          </RecycleScroller>
        </div>
      </div>

      <!-- Top Artists -->
      <div v-if="activeTab === 'artists'" class="section">
        <div class="section-header">
          <h2 class="section-title">Top Artists</h2>
          <span class="count">{{ topArtists.length }} artists</span>
        </div>
        <div v-if="topArtists.length === 0" class="empty-text">
          No artist data yet. Play some songs to see your favorite artists!
        </div>
        <div v-else class="artist-grid">
          <div
            v-for="(artist, index) in topArtists"
            :key="artist.name"
            class="artist-card"
            @click="searchArtist(artist.name)"
          >
            <div class="artist-rank">{{ index + 1 }}</div>
            <div class="artist-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="artist-info">
              <h3 class="artist-name">{{ artist.name }}</h3>
              <p class="artist-plays">{{ artist.playCount }} plays</p>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="activeTab === 'history'" class="section">
        <div class="section-header">
          <h2 class="section-title">Recently Played</h2>
          <span class="count">{{ library.history.length }} tracks</span>
          <button v-if="library.history.length > 0" class="clear-btn" @click="clearHistory">
            Clear History
          </button>
        </div>
        <div v-if="library.history.length === 0" class="empty-text">
          No listening history yet. Start playing songs to see them here!
        </div>
        <div v-else class="track-list-scrollable">
          <RecycleScroller
            :items="library.history"
            :item-size="72"
            key-field="id"
            class="scroller"
            v-slot="{ item }"
          >
            <div class="track-row">
              <TrackCard :track="normalizeSong(item)" @play="handlePlay" />
              <span class="played-time">{{ formatTime(item.played_at) }}</span>
            </div>
          </RecycleScroller>
        </div>
      </div>

      <!-- Playlists -->
      <div v-if="activeTab === 'playlists'" class="section">
        <div class="section-header">
          <h2 class="section-title">Your Playlists</h2>
          <span class="count">{{ library.playlists.length }} playlists</span>
          <button class="create-btn" @click="createPlaylist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Playlist
          </button>
        </div>
        <div v-if="library.playlists.length === 0" class="empty-text">
          No playlists yet. Create your first playlist to organize your music!
        </div>
        <div v-else class="playlist-grid">
          <div
            v-for="playlist in library.playlists"
            :key="playlist.id"
            class="playlist-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="playlist-cover" :style="{ background: getPlaylistGradient(playlist.color) }">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-meta">Playlist</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Playlists -->
      <div v-if="activeTab === 'smart-playlists'" class="section">
        <div class="section-header">
          <h2 class="section-title">Smart Playlists</h2>
          <span class="count">Auto-generated from your library</span>
        </div>
        <div class="smart-grid">
          <div
            v-for="pl in smartPlaylistsStore.smartPlaylists"
            :key="pl.id"
            class="smart-card"
            @click="openSmartPlaylist(pl)"
          >
            <div class="smart-cover">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="getSmartIcon(pl.rule)"></svg>
            </div>
            <div class="smart-info">
              <h3 class="smart-name">{{ pl.name }}</h3>
              <p class="smart-desc">{{ pl.description }}</p>
            </div>
          </div>
        </div>

        <div v-if="smartPlaylistTracks.length > 0" class="smart-results">
          <div class="section-header" style="margin-top: 24px;">
            <h2 class="section-title">{{ activeSmartPlaylist?.name }}</h2>
            <button class="clear-btn" @click="clearSmartPlaylist">Clear</button>
          </div>
          <div class="track-list">
            <TrackCard
              v-for="track in smartPlaylistTracks"
              :key="track.videoId || track.id"
              :track="{
                videoId: track.videoId || track.id,
                title: track.title,
                artist: track.artist,
                thumbnail: track.thumbnail || track.thumbnail_url,
                duration: track.duration || track.duration_seconds
              }"
              @play="handleSmartPlay"
            />
          </div>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div v-if="activeTab === 'stats'" class="section">
        <div class="section-header">
          <h2 class="section-title">Listening Stats</h2>
          <span class="count">Your music journey</span>
        </div>
        <div v-if="stats.isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your stats...</p>
        </div>
        <div v-else class="stats-dashboard">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.totalSongs }}</div>
              <div class="stat-label">Total Songs</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.totalArtists }}</div>
              <div class="stat-label">Artists</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.totalPlays }}</div>
              <div class="stat-label">Total Plays</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.formattedTime }}</div>
              <div class="stat-label">Listening Time</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.totalFavorites }}</div>
              <div class="stat-label">Favorites</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div class="stat-value">{{ stats.totalPlaylists }}</div>
              <div class="stat-label">Playlists</div>
            </div>
          </div>

          <div v-if="stats.topSongs.length > 0" class="stats-section">
            <div class="section-header">
              <h3 class="section-title">Top Songs</h3>
              <span class="count">Most played</span>
            </div>
            <div class="track-list">
              <div v-for="(song, index) in stats.topSongs.slice(0, 10)" :key="song.videoId" class="track-row">
                <span class="track-rank">{{ index + 1 }}</span>
                <TrackCard
                  :track="song"
                  @play="handlePlay"
                />
                <span class="play-count">{{ song.playCount }} plays</span>
              </div>
            </div>
          </div>

          <div v-if="stats.topArtists.length > 0" class="stats-section">
            <div class="section-header">
              <h3 class="section-title">Top Artists</h3>
              <span class="count">Most played</span>
            </div>
            <div class="artist-grid">
              <div
                v-for="(artist, index) in stats.topArtists"
                :key="artist.name"
                class="artist-card"
                @click="searchArtist(artist.name)"
              >
                <div class="artist-rank">{{ index + 1 }}</div>
                <div class="artist-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div class="artist-info">
                  <h3 class="artist-name">{{ artist.name }}</h3>
                  <p class="artist-plays">{{ artist.playCount }} plays</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CreatePlaylistModal v-model:show="showCreatePlaylistModal" @created="onPlaylistCreated" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import { useStatsStore } from '../stores/stats.js'
import { useSmartPlaylistsStore } from '../stores/smartPlaylists.js'
import TrackCard from '../components/TrackCard.vue'
import CreatePlaylistModal from '../components/CreatePlaylistModal.vue'

const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()
const stats = useStatsStore()
const smartPlaylistsStore = useSmartPlaylistsStore()

const activeTab = ref('songs')
const topSongs = ref([])
const topArtists = ref([])

function normalizeSong(s) {
  return {
    videoId: s.video_id || s.videoId,
    title: s.title,
    artist: s.artist,
    thumbnail: s.thumbnail_url || s.thumbnail,
    duration: s.duration_seconds || s.duration
  }
}
const showCreatePlaylistModal = ref(false)

const tabs = [
  { id: 'songs', label: 'All Songs', icon: 'svg' },
  { id: 'most-listened', label: 'Most Listened', icon: 'svg' },
  { id: 'artists', label: 'Top Artists', icon: 'svg' },
  { id: 'history', label: 'History', icon: 'svg' },
  { id: 'playlists', label: 'Playlists', icon: 'svg' },
  { id: 'smart-playlists', label: 'Smart', icon: 'svg' },
  { id: 'stats', label: 'Stats', icon: 'svg' }
]

const smartPlaylistTracks = ref([])
const activeSmartPlaylist = ref(null)

const totalSongs = computed(() => library.songs.length)
const totalArtists = computed(() => {
  const artists = new Set(library.songs.map(s => s.artist))
  return artists.size
})

onMounted(async () => {
  await library.loadSongs()
  await library.loadHistory()
  await library.loadPlaylists()
  await stats.loadStats()
})

async function loadStats() {
  try {
    const electron = window.electron
    const topSongsResult = await electron.sqlite.getTopSongs(50)
    const topArtistsResult = await electron.sqlite.getTopArtists(20)
    
    if (topSongsResult.success) {
      topSongs.value = topSongsResult.data
    }
    if (topArtistsResult.success) {
      topArtists.value = topArtistsResult.data
    }
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

function handlePlay(track) {
  player.setQueue([track], 0)
  player.playTrack(track)
}

function goToPlaylist(id) {
  router.push(`/playlist/${id}`)
}

function searchArtist(artistName) {
  router.push({ name: 'search', query: { q: artistName } })
}

async function createPlaylist() {
  showCreatePlaylistModal.value = true
}

function onPlaylistCreated(playlist) {
  router.push(`/playlist/${playlist.id}`)
}

const colorGradients = {
  indigo: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  pink: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  orange: 'linear-gradient(135deg, #f97316, #ef4444)',
  amber: 'linear-gradient(135deg, #f59e0b, #f97316)',
  emerald: 'linear-gradient(135deg, #10b981, #059669)',
  cyan: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  slate: 'linear-gradient(135deg, #475569, #1e293b)',
  fuchsia: 'linear-gradient(135deg, #d946ef, #6366f1)'
}

function getPlaylistGradient(color) {
  return colorGradients[color] || colorGradients.indigo
}

async function clearHistory() {
  if (confirm('Clear all listening history?')) {
    await library.clearHistory()
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function openSmartPlaylist(pl) {
  activeSmartPlaylist.value = pl
  smartPlaylistTracks.value = smartPlaylistsStore.generatePlaylist(pl.id)
}

function clearSmartPlaylist() {
  activeSmartPlaylist.value = null
  smartPlaylistTracks.value = []
}

function handleSmartPlay(track) {
  if (smartPlaylistTracks.value.length > 0) {
    const idx = smartPlaylistTracks.value.findIndex(t => (t.videoId || t.id) === (track.videoId || track.id))
    player.setQueue(smartPlaylistTracks.value, idx >= 0 ? idx : 0)
    player.playTrack(track)
  }
}

function getSmartIcon(rule) {
  const icons = {
    recentlyAdded: '<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
    mostPlayed: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    favorites: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    longDuration: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
    shortDuration: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>'
  }
  return icons[rule] || '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>'
}

</script>

<style scoped>
.library-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--color-text);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 32px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 32px), transparent 100%);
}

.filter-tabs::-webkit-scrollbar {
  height: 4px;
}

.filter-tabs > * {
  scroll-snap-align: start;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-tab svg {
  width: 18px;
  height: 18px;
}

.filter-tab:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-text);
}

.filter-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  min-height: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}

.count {
  font-size: 14px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

.clear-btn,
.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

.create-btn {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.create-btn:hover {
  background: var(--color-primary-dark);
}

.create-btn svg {
  width: 16px;
  height: 16px;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid var(--color-border);
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}

.track-list-scrollable {
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  min-height: 200px;
}

.track-list-scrollable .scroller {
  height: calc(100vh - 280px);
}

.track-list .track-card {
  margin: 0;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.track-row > :nth-child(2) {
  flex: 1;
}

.track-rank {
  width: 32px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.play-count,
.played-time {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.artist-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.artist-card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.artist-rank {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.artist-avatar svg {
  width: 36px;
  height: 36px;
}

.artist-info {
  text-align: center;
  width: 100%;
}

.artist-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-plays {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.playlist-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.playlist-card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
  transition: transform var(--transition-fast);
}

.playlist-card:hover .playlist-cover {
  transform: scale(1.03);
}

.playlist-cover svg {
  width: 48px;
  height: 48px;
}

.playlist-info {
  text-align: center;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-text {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
}

.loading-state p {
  color: var(--color-text-muted);
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .filter-tabs {
    gap: 6px;
  }

  .filter-tab {
    padding: 8px 16px;
    font-size: 13px;
  }

  .artist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .page-title { font-size: 1.8rem; }
  .page-subtitle { font-size: 12px; }
  .filter-tab { padding: 7px 12px; font-size: 12px; gap: 6px; }
  .filter-tab span { display: inline; }
  .section-header { flex-wrap: wrap; gap: 8px; }
  .count { font-size: 12px; }
  .artist-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  .playlist-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1700px) {
  .library-view { max-width: 1600px; margin: 0 auto; }
  .playlist-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  .artist-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}

.stats-dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
  font-family: var(--font-mono);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-section {
  margin-top: 8px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.smart-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.smart-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.smart-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.smart-cover svg {
  width: 24px;
  height: 24px;
}

.smart-info {
  min-width: 0;
}

.smart-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.smart-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.smart-results {
  margin-top: 16px;
}

.clear-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background: rgba(244, 67, 54, 0.06);
}
</style>
