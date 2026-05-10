<template>
  <div class="home">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Good {{ greeting }}</h1>
        <p class="page-sub">Discover something new today</p>
      </div>
    </header>

    <!-- Pill Filter Tabs -->
    <div class="pill-tabs">
      <button v-for="tab in tabs" :key="tab" class="pill" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
    </div>

    <!-- Now Playing Spotlight -->
    <section v-if="currentTrack" class="section spotlight-section">
      <div class="section-head">
        <div class="section-icon now"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
        <h2>Now Playing</h2>
      </div>
      <div class="spotlight-card" @click="handlePlay(currentTrack)">
        <img v-if="currentTrack.thumbnail" :src="currentTrack.thumbnail" :alt="currentTrack.title" class="spotlight-thumb" />
        <div v-else class="spotlight-thumb spotlight-thumb-empty">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        <div class="spotlight-copy">
          <span class="spotlight-kicker">Live session</span>
          <h3>{{ currentTrack.title }}</h3>
          <p>{{ currentTrack.artist }}</p>
        </div>
        <div class="spotlight-action">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </section>

    <!-- Related Groups -->
    <section v-if="relatedGroups.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon related"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 3H3v7h7V3zm11 0h-7v7h7V3zM10 14H3v7h7v-7zm11 0h-7v7h7v-7z"/></svg></div>
        <h2>Related Groups</h2>
      </div>
      <div class="group-row">
        <button v-for="group in relatedGroups" :key="group.id" class="group-card" @click="playGroup(group)">
          <div class="group-thumbs">
            <img v-for="(thumb, index) in group.thumbnails" :key="thumb + index" :src="thumb" class="group-thumb" :style="{ '--thumb-index': index }" />
            <div v-if="group.thumbnails.length === 0" class="group-thumb group-thumb-empty">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
          </div>
          <div class="group-copy">
            <span class="group-title">{{ group.title }}</span>
            <span class="group-desc">{{ group.description }}</span>
          </div>
          <span class="group-count">{{ group.count }} tracks</span>
        </button>
      </div>
    </section>

    <!-- Discover Music - Big Cards -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg></div>
        <h2>Discover Music</h2>
      </div>
      <div class="scroll-row">
        <div v-for="(c, i) in filteredCategories" :key="c.id" class="big-card" @click="searchCategory(c)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: c.gradient }">
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ c.name }}</span>
          <span class="card-desc">{{ c.description }}</span>
        </div>
      </div>
    </section>

    <!-- Favorite Songs -->
    <section v-if="favList.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon fav"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
        <h2>Favorite Songs</h2>
        <router-link to="/favorites" class="see-all">View all</router-link>
      </div>
      <div class="track-list">
        <TrackCard v-for="t in favList.slice(0, 6)" :key="t.videoId || t.video_id" :track="t" @play="handlePlay" />
      </div>
    </section>

    <!-- Best Tracks / Top Picks -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon best"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <h2>Best Tracks</h2>
      </div>
      <div class="scroll-row">
        <div v-for="(c, i) in bestTracks" :key="c.id" class="big-card" @click="searchCategory(c)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: c.gradient }">
            <img v-if="c.thumbnail" :src="c.thumbnail" :alt="c.name" class="cover-thumb" loading="lazy" />
            <div class="cover-overlay"></div>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ c.name }}</span>
          <span class="card-desc">{{ c.description }}</span>
        </div>
      </div>
    </section>

    <!-- Fresh Picks -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon fresh"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4H20l-4.6 3.3L17.2 16 12 12.8 6.8 16l1.8-5.3L4 7.4h6.2L12 2z"/></svg></div>
        <h2>Fresh Picks</h2>
      </div>
      <div class="scroll-row">
        <div v-for="(c, i) in freshPicks" :key="c.id" class="big-card" @click="searchCategory(c)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: c.gradient }">
            <img v-if="c.thumbnail" :src="c.thumbnail" :alt="c.name" class="cover-thumb" loading="lazy" />
            <div class="cover-overlay"></div>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ c.name }}</span>
          <span class="card-desc">{{ c.description }}</span>
        </div>
      </div>
    </section>

    <!-- Most Listening -->
    <section v-if="history.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon listen"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg></div>
        <h2>Most Listening</h2>
        <router-link to="/recent" class="see-all">View all</router-link>
      </div>
      <div class="track-list">
        <TrackCard v-for="(item, i) in history.slice(0, 8)" :key="item.id" :track="{ videoId: item.video_id, title: item.title, artist: item.artist, thumbnail: item.thumbnail_url, duration: item.duration_seconds }" :style="{ animationDelay: i * 30 + 'ms' }" @play="handlePlay" />
      </div>
    </section>

    <!-- Artists -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon artist"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
        <h2>Popular Artists</h2>
      </div>
      <div class="scroll-row">
        <div v-for="(a, i) in artists" :key="a.id" class="artist-card" @click="searchCategory(a)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="artist-avatar" :style="{ background: a.gradient }">
            <img v-if="a.thumbnail" :src="a.thumbnail" :alt="a.name" class="artist-photo" loading="lazy" />
            <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <span class="artist-name">{{ a.name }}</span>
        </div>
      </div>
    </section>

    <!-- Mood Mixes -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon mood"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21c-4.4 0-8-3.6-8-8 0-5.2 4-8.5 8-11 4 2.5 8 5.8 8 11 0 4.4-3.6 8-8 8zm0-2c3.3 0 6-2.7 6-6 0-3.6-2.6-5.9-6-8.1C8.6 7.1 6 9.4 6 13c0 3.3 2.7 6 6 6z"/></svg></div>
        <h2>Mood Mixes</h2>
      </div>
      <div class="scroll-row">
        <div v-for="(c, i) in moodMixes" :key="c.id" class="big-card" @click="searchCategory(c)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: c.gradient }">
            <img v-if="c.thumbnail" :src="c.thumbnail" :alt="c.name" class="cover-thumb" loading="lazy" />
            <div class="cover-overlay"></div>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ c.name }}</span>
          <span class="card-desc">{{ c.description }}</span>
        </div>
      </div>
    </section>

    <!-- Your Library -->
    <section v-if="playlists.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon lib"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg></div>
        <h2>Your Library</h2>
        <router-link to="/library" class="see-all">View all</router-link>
      </div>
      <div class="scroll-row">
        <div v-for="(p, i) in playlists.slice(0, 8)" :key="p.id" class="big-card" @click="goToPlaylist(p.id)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: getGrad(i) }">
            <img v-if="playlistThumbs[i]" :src="playlistThumbs[i]" :alt="p.name" class="cover-thumb" loading="lazy" />
            <div class="cover-overlay"></div>
            <svg class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ p.name }}</span>
          <span class="card-desc">{{ p.song_count || 0 }} songs</span>
        </div>
      </div>
    </section>

    <!-- Recently Played -->
    <section v-if="history.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon recent"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg></div>
        <h2>Recently Played</h2>
      </div>
      <div class="track-list">
        <TrackCard v-for="(item, i) in history.slice(0, 5)" :key="'r'+item.id" :track="{ videoId: item.video_id, title: item.title, artist: item.artist, thumbnail: item.thumbnail_url, duration: item.duration_seconds }" @play="handlePlay" />
      </div>
    </section>

    <!-- Empty -->
    <section v-if="playlists.length === 0 && history.length === 0 && favList.length === 0" class="empty-state">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
      <h3>Start your musical journey</h3>
      <p>Explore the categories above to discover music</p>
    </section>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { storeToRefs } from 'pinia'
import TrackCard from '../components/TrackCard.vue'
import { normalizeTrack, normalizeTrackList } from '../utils/trackNormalizer.js'

const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()
const favStore = useFavoritesStore()
const { history, playlists, songs } = storeToRefs(library)
const { currentTrack } = storeToRefs(player)

const normalizedHistory = computed(() => normalizeTrackList(history.value))
const normalizedSongs = computed(() => normalizeTrackList(songs.value))
const normalizedFavorites = computed(() => normalizeTrackList(favStore.favoriteSongs))

const relatedGroups = computed(() => {
  const track = currentTrack.value ? normalizeTrack(currentTrack.value) : null
  if (!track) return []

  const artistMatches = normalizedSongs.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const favoriteMatches = normalizedFavorites.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const recentMatches = normalizedHistory.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const libraryMatches = normalizedSongs.value
    .filter(item => item.videoId !== track.videoId)
    .slice(0, 4)

  return [
    {
      id: 'artist',
      title: `More from ${track.artist}`,
      description: artistMatches.length > 0 ? 'Songs from your library' : 'No direct matches yet',
      count: artistMatches.length,
      thumbnails: artistMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: artistMatches.length > 0 ? artistMatches : libraryMatches
    },
    {
      id: 'favorites',
      title: 'Favorites nearby',
      description: favoriteMatches.length > 0 ? 'Songs you already love' : 'Your saved music',
      count: favoriteMatches.length,
      thumbnails: favoriteMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: favoriteMatches.length > 0 ? favoriteMatches : normalizedFavorites.value.slice(0, 4)
    },
    {
      id: 'recent',
      title: 'Recently played',
      description: recentMatches.length > 0 ? 'Similar items from history' : 'Recent listening activity',
      count: recentMatches.length,
      thumbnails: recentMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: recentMatches.length > 0 ? recentMatches : normalizedHistory.value.slice(0, 4)
    }
  ].filter(group => group.tracks.length > 0)
})

const favList = computed(() => {
  try {
    return normalizeTrackList(favStore.favoriteSongs)
  } catch (e) { return [] }
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
})

const activeTab = ref('All')
const tabs = ['All', 'Hindi', 'Telugu', 'Tamil', 'Punjabi', 'Bollywood', 'Devotional']

const imageThumbs = {
  concert: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
  guitar: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
  stage: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=900&q=80',
  crowd: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
  dj: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  record: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
  mic: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=900&q=80',
  headphones: 'https://images.unsplash.com/photo-1518444028785-3b8a0b1d5f6e?auto=format&fit=crop&w=900&q=80'
}

const curatedCategories = [
  { id: 'hindi-songs', name: 'Hindi Hits', description: 'Popular Hindi music', query: 'hindi songs 2024', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', tag: 'Hindi', thumbnail: imageThumbs.guitar },
  { id: 'telugu-songs', name: 'Telugu Beats', description: 'Latest Telugu hits', query: 'telugu songs 2024', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', tag: 'Telugu', thumbnail: imageThumbs.stage },
  { id: 'indian-songs', name: 'Indian Vibes', description: 'Best of Indian music', query: 'indian songs popular', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)', tag: 'Hindi', thumbnail: imageThumbs.concert },
  { id: 'love-songs', name: 'Love Songs', description: 'Romantic melodies', query: 'love songs romantic', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', tag: 'Hindi', thumbnail: imageThumbs.headphones },
  { id: 'tamil-songs', name: 'Tamil Waves', description: 'Tamil music collection', query: 'tamil songs 2024', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', tag: 'Tamil', thumbnail: imageThumbs.crowd },
  { id: 'punjabi-songs', name: 'Punjabi Fire', description: 'Energetic Punjabi beats', query: 'punjabi songs 2024', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', tag: 'Punjabi', thumbnail: imageThumbs.dj },
  { id: 'bollywood-hits', name: 'Bollywood', description: 'Top Bollywood tracks', query: 'bollywood songs 2024', gradient: 'linear-gradient(135deg, #c2410c, #b91c1c)', tag: 'Bollywood', thumbnail: imageThumbs.mic },
  { id: 'devotional', name: 'Devotional', description: 'Spiritual & devotional', query: 'devotional songs indian', gradient: 'linear-gradient(135deg, #fcd34d, #f97316)', tag: 'Devotional', thumbnail: imageThumbs.record },
  { id: 'party-songs', name: 'Party Mix', description: 'Dance & party hits', query: 'party songs hindi 2024', gradient: 'linear-gradient(135deg, #f97316, #fbbf24)', tag: 'Hindi', thumbnail: imageThumbs.stage },
  { id: 'sad-songs', name: 'Sad Songs', description: 'Emotional tracks', query: 'sad songs hindi', gradient: 'linear-gradient(135deg, #ea580c, #78350f)', tag: 'Hindi', thumbnail: imageThumbs.record },
]

const freshPicks = [
  { id: 'fresh-songs', name: 'Fresh Releases', description: 'New music across languages', query: 'new songs 2024', gradient: 'linear-gradient(135deg, #ff6b35, #f97316)', thumbnail: imageThumbs.concert },
  { id: 'night-drive', name: 'Night Drive', description: 'Smooth music for late rides', query: 'night drive songs', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', thumbnail: imageThumbs.headphones },
  { id: 'acoustic-session', name: 'Acoustic Session', description: 'Warm unplugged takes', query: 'acoustic songs', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', thumbnail: imageThumbs.guitar },
  { id: 'retro-grooves', name: 'Retro Grooves', description: 'Classic sounds with style', query: 'retro hindi songs', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', thumbnail: imageThumbs.record },
  { id: 'travel-vibes', name: 'Travel Vibes', description: 'Open-road energy', query: 'travel songs', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)', thumbnail: imageThumbs.crowd },
]

const moodMixes = [
  { id: 'chill-vibes', name: 'Chill Vibes', description: 'Easy listening and calm beats', query: 'chill songs', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', thumbnail: imageThumbs.headphones },
  { id: 'romantic-flow', name: 'Romantic Flow', description: 'Soft songs with a slow burn', query: 'romantic songs', gradient: 'linear-gradient(135deg, #ff758c, #ff7eb3)', thumbnail: imageThumbs.guitar },
  { id: 'party-anthem', name: 'Party Anthem', description: 'Big hooks and loud energy', query: 'party songs', gradient: 'linear-gradient(135deg, #ff512f, #f09819)', thumbnail: imageThumbs.dj },
  { id: 'workout-energy', name: 'Workout Energy', description: 'Fast tracks to keep pace', query: 'workout songs', gradient: 'linear-gradient(135deg, #fc4a1a, #f7b733)', thumbnail: imageThumbs.stage },
  { id: 'devotional-calm', name: 'Devotional Calm', description: 'Quiet and centered mood', query: 'devotional songs', gradient: 'linear-gradient(135deg, #f6d365, #fda085)', thumbnail: imageThumbs.record },
]

const filteredCategories = computed(() => {
  if (activeTab.value === 'All') return curatedCategories
  return curatedCategories.filter(c => c.tag === activeTab.value)
})

const bestTracks = [
  { id: 'top-50', name: 'Top 50 India', description: 'Most streamed', query: 'top 50 india songs', gradient: 'linear-gradient(135deg, #f97316, #b91c1c)', thumbnail: imageThumbs.concert },
  { id: 'trending', name: 'Trending Now', description: 'What\'s hot', query: 'trending songs india 2024', gradient: 'linear-gradient(135deg, #fbbf24, #ea580c)', thumbnail: imageThumbs.dj },
  { id: 'new-releases', name: 'New Releases', description: 'Fresh music', query: 'new songs 2024 hindi', gradient: 'linear-gradient(135deg, #f59e0b, #dc2626)', thumbnail: imageThumbs.stage },
  { id: 'old-classics', name: 'Classics', description: 'Timeless hits', query: 'classic hindi songs', gradient: 'linear-gradient(135deg, #c2410c, #78350f)', thumbnail: imageThumbs.record },
  { id: 'workout', name: 'Workout', description: 'High energy', query: 'workout songs hindi', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', thumbnail: imageThumbs.guitar },
]

const artists = [
  { id: 'arijit', name: 'Arijit Singh', query: 'arijit singh songs', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', thumbnail: imageThumbs.guitar },
  { id: 'shreya', name: 'Shreya Ghoshal', query: 'shreya ghoshal songs', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', thumbnail: imageThumbs.stage },
  { id: 'atif', name: 'Atif Aslam', query: 'atif aslam songs', gradient: 'linear-gradient(135deg, #fb923c, #dc2626)', thumbnail: imageThumbs.concert },
  { id: 'neha', name: 'Neha Kakkar', query: 'neha kakkar songs', gradient: 'linear-gradient(135deg, #fbbf24, #ea580c)', thumbnail: imageThumbs.dj },
  { id: 'armaan', name: 'Armaan Malik', query: 'armaan malik songs', gradient: 'linear-gradient(135deg, #c2410c, #f97316)', thumbnail: imageThumbs.mic },
  { id: 'jubin', name: 'Jubin Nautiyal', query: 'jubin nautiyal songs', gradient: 'linear-gradient(135deg, #f97316, #78350f)', thumbnail: imageThumbs.record },
  { id: 'sid-sriram', name: 'Sid Sriram', query: 'sid sriram songs', gradient: 'linear-gradient(135deg, #fcd34d, #f59e0b)', thumbnail: imageThumbs.headphones },
  { id: 'anirudh', name: 'Anirudh', query: 'anirudh songs', gradient: 'linear-gradient(135deg, #ea580c, #b91c1c)', thumbnail: imageThumbs.crowd },
]

const playlistThumbs = [
  imageThumbs.concert,
  imageThumbs.guitar,
  imageThumbs.stage,
  imageThumbs.crowd,
  imageThumbs.dj,
  imageThumbs.record,
  imageThumbs.mic,
  imageThumbs.headphones
]

const grads = [
  'linear-gradient(135deg,#f97316,#ea580c)', 'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#fb923c,#ef4444)', 'linear-gradient(135deg,#fbbf24,#ea580c)',
  'linear-gradient(135deg,#c2410c,#dc2626)', 'linear-gradient(135deg,#fcd34d,#f59e0b)'
]
function getGrad(i) { return grads[i % grads.length] }

onMounted(async () => {
  await Promise.all([library.loadSongs(), library.loadHistory(), library.loadPlaylists(), favStore.loadFavorites()])
})

function handlePlay(track) { player.setQueue([track], 0); player.playTrack(track) }
function goToPlaylist(id) { router.push(`/playlist/${id}`) }
function searchCategory(c) { router.push(`/category/${c.id}`) }
function playGroup(group) {
  if (group.tracks?.length > 0) {
    handlePlay(group.tracks[0])
  }
}
</script>

<style scoped>
.home { max-width: 1400px; margin: 0 auto; padding: 28px 0 0 0; }

/* Header */
.page-header { margin-bottom: 20px; }
.page-title { font-size: 28px; font-weight: 800; color: var(--color-text); letter-spacing: -0.5px; }
.page-sub { font-size: 14px; color: var(--color-text-muted); margin-top: 4px; font-weight: 400; }

/* Pill Filter Tabs */
.pill-tabs { display: flex; gap: 6px; margin-bottom: 28px; overflow-x: auto; padding-bottom: 4px; }
.pill-tabs::-webkit-scrollbar { display: none; }
.pill {
  padding: 6px 16px; border-radius: 100px; border: 1px solid var(--color-border-light);
  background: transparent; color: var(--color-text-muted); font-size: 13px; font-weight: 500;
  cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
}
.pill:hover { color: var(--color-text); border-color: var(--color-primary); background: rgba(249,115,22,0.06); }
.pill.active {
  background: var(--color-primary); color: white; border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(249,115,22,0.3);
}

/* Section */
.section { margin-bottom: 48px; animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.section-head h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: var(--color-text); flex: 1; }
.section-icon {
  width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  background: rgba(249,115,22,0.1); color: var(--color-primary); flex-shrink: 0;
}
.section-icon svg { width: 16px; height: 16px; }
.section-icon.fav { background: rgba(239,68,68,0.1); color: #ef4444; }
.section-icon.best { background: rgba(251,191,36,0.12); color: #f59e0b; }
.section-icon.listen { background: rgba(249,115,22,0.1); color: #f97316; }
.section-icon.artist { background: rgba(251,146,60,0.1); color: #fb923c; }
.section-icon.lib { background: rgba(249,115,22,0.08); color: var(--color-primary); }
.section-icon.recent { background: rgba(245,158,11,0.1); color: #f59e0b; }
.section-icon.now { background: rgba(249,115,22,0.12); color: #f97316; }
.section-icon.related { background: rgba(124,58,237,0.08); color: #7c3aed; }
.section-icon.fresh { background: rgba(16,185,129,0.12); color: #10b981; }
.section-icon.mood { background: rgba(99,102,241,0.12); color: #6366f1; }

.see-all {
  font-size: 12px; font-weight: 600; color: var(--color-primary); text-decoration: none;
  padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(249,115,22,0.2);
  transition: all 0.15s ease;
}
.see-all:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.35); }

/* Horizontal Scroll Row */
.scroll-row {
  display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px;
  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
}
.scroll-row::-webkit-scrollbar { height: 0; }

/* Big Cards */
.big-card {
  flex-shrink: 0; width: 200px; cursor: pointer;
  animation: scaleUp 0.35s ease both; scroll-snap-align: start;
}
@keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

.big-card-cover {
  width: 200px; height: 200px; border-radius: 14px; position: relative;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.cover-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.18) 100%);
}
.big-card-cover .cover-icon,
.big-card-cover .card-play {
  position: relative;
  z-index: 1;
}
.big-card:hover .big-card-cover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }

.cover-icon { width: 48px; height: 48px; color: rgba(255,255,255,0.8); filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25)); }

.card-play {
  position: absolute; bottom: 10px; right: 10px; width: 36px; height: 36px;
  background: rgba(255,255,255,0.95); border-radius: 50%; display: flex;
  align-items: center; justify-content: center; opacity: 0; transform: translateY(6px);
  transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.card-play svg { width: 16px; height: 16px; color: var(--color-primary); margin-left: 1px; }
.big-card:hover .card-play { opacity: 1; transform: translateY(0); }

.card-label { display: block; font-size: 14px; font-weight: 700; color: var(--color-text); margin-top: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-desc { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }

/* Artist Cards */
.artist-card { flex-shrink: 0; width: 110px; text-align: center; cursor: pointer; animation: scaleUp 0.35s ease both; }
.artist-avatar {
  width: 96px; height: 96px; border-radius: 50%; margin: 0 auto; display: flex;
  align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.artist-avatar svg { width: 36px; height: 36px; color: rgba(255,255,255,0.85); }
.artist-photo { width: 100%; height: 100%; object-fit: cover; }
.artist-card:hover .artist-avatar { transform: scale(1.06); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.artist-name { display: block; font-size: 13px; font-weight: 700; color: var(--color-text); margin-top: 12px; }

/* Track List */
.track-list { display: flex; flex-direction: column; gap: 2px; }

/* Spotlight */
.spotlight-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(249, 115, 22, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.spotlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.12);
}

.spotlight-thumb {
  width: 112px;
  height: 112px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: var(--shadow-md);
}

.spotlight-thumb-empty {
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.spotlight-thumb-empty svg {
  width: 36px;
  height: 36px;
}

.spotlight-copy {
  min-width: 0;
}

.spotlight-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.spotlight-copy h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  color: var(--color-text);
}

.spotlight-copy p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.spotlight-action {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--color-primary);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.28);
}

.spotlight-action svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
}

/* Related groups */
.group-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.group-card {
  text-align: left;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface-elevated);
  border-radius: 18px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.18);
  box-shadow: var(--shadow-md);
}

.group-thumbs {
  width: 84px;
  height: 56px;
  position: relative;
}

.group-thumb {
  position: absolute;
  top: calc(var(--thumb-index, 0) * 4px);
  left: calc(var(--thumb-index, 0) * 14px);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  border: 2px solid var(--color-surface-elevated);
}

.group-thumb-empty {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(245, 158, 11, 0.18));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.group-thumb-empty svg {
  width: 18px;
  height: 18px;
}

.group-copy {
  min-width: 0;
}

.group-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-desc {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.group-card, .spotlight-card {
  font: inherit;
}

.group-card,
.spotlight-card {
  -webkit-appearance: none;
  appearance: none;
}

.group-card:focus-visible,
.spotlight-card:focus-visible {
  outline: 2px solid rgba(249, 115, 22, 0.35);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .spotlight-card {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .spotlight-action {
    grid-column: 1 / -1;
    justify-self: end;
  }
}

@media (max-width: 640px) {
  .spotlight-card {
    grid-template-columns: 88px minmax(0, 1fr);
    padding: 12px;
    border-radius: 18px;
  }

  .spotlight-thumb {
    width: 88px;
    height: 88px;
    border-radius: 14px;
  }

  .spotlight-copy h3 {
    font-size: 18px;
  }

  .group-card {
    grid-template-columns: auto 1fr;
  }

  .group-count {
    grid-column: 2;
    justify-self: start;
  }
}

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon {
  width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(249,115,22,0.25);
}
.empty-icon svg { width: 28px; height: 28px; color: white; }
.empty-state h3 { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.empty-state p { font-size: 13px; color: var(--color-text-muted); }

.bottom-spacer { height: 20px; }

@media (max-width: 768px) {
  .big-card-cover { width: 160px; height: 160px; }
  .big-card { width: 160px; }
  .artist-avatar { width: 72px; height: 72px; }
  .artist-card { width: 88px; }
}
</style>
