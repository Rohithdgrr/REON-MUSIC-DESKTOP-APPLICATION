<template>
  <div class="favorites-view">
    <!-- Glassmorphism Header -->
    <div class="view-header">
      <div class="header-backdrop" :style="{ backgroundImage: headerBackdropUrl ? `url(${headerBackdropUrl})` : 'none' }"></div>
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-cover-wrap">
          <div class="header-icon-glass">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
        <div class="header-info">
          <span class="view-type-tag">Playlist</span>
          <h1 class="page-title">Favorites</h1>
          <p class="subtitle">
            <span class="highlight">{{ favoriteCount }}</span> {{ favoriteCount === 1 ? 'song' : 'songs' }} saved
            <span v-if="totalDuration" class="duration-stat"> • {{ totalDuration }}</span>
          </p>
        </div>
      </div>
      
      <div class="header-actions" v-if="favoriteCount > 0">
        <button @click="playAll" class="play-all-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play All
        </button>
        <button @click="shuffleAll" class="shuffle-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
          Shuffle
        </button>
      </div>
    </div>

    <!-- Filter & Search Strip -->
    <div class="filter-strip" v-if="favoriteCount > 0">
      <div class="search-box" :class="{ focused: searchQuery.length > 0 }">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search favorites..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="filter-actions">
        <div class="sort-controls">
          <span class="sort-label">Sort by</span>
          <div class="sort-select-wrapper">
            <select v-model="sortBy" class="sort-select">
              <option value="addedAt">Date Added</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="duration">Duration</option>
            </select>
            <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        
        <button @click="toggleSortOrder" class="direction-btn" :class="{ active: sortOrder === 'asc' }" :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline v-if="sortOrder === 'desc'" points="5 12 12 5 19 12"/>
            <polyline v-else points="19 12 12 19 5 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-list">
        <div v-for="n in 5" :key="n" class="skeleton-row">
          <div class="skeleton-thumb"></div>
          <div class="skeleton-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-artist"></div>
          </div>
          <div class="skeleton-dur"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="favoriteCount === 0" class="empty-state">
      <div class="empty-glow"></div>
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <h2>No favorites yet</h2>
      <p>Click the heart icon on any song to build your personal collection.</p>
      <button @click="goToSearch" class="browse-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Discover Music
      </button>
    </div>

    <!-- Empty Search State -->
    <div v-else-if="filteredSongs.length === 0" class="empty-search-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h3>No matches found</h3>
      <p>No songs match "{{ searchQuery }}" in your favorites.</p>
    </div>

    <!-- Favorites List -->
    <div v-else class="favorites-list-container">
      <div class="list-headers">
        <span class="header-col-rank">#</span>
        <span class="header-col-thumb"></span>
        <span class="header-col-title">Title</span>
        <span class="header-col-artist">Artist</span>
        <span class="header-col-actions">Actions</span>
        <span class="header-col-dur">Duration</span>
      </div>
      <div class="favorites-list glass-panel">
        <TrackCard
          v-for="(song, idx) in filteredSongs"
          :key="song.videoId"
          :index="idx + 1"
          :track="song"
          @play="playSong"
          class="favorite-track-card"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites.js'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const player = usePlayerStore()

const isLoading = ref(true)
const searchQuery = ref('')
const sortBy = ref('addedAt')
const sortOrder = ref('desc')

const favoriteSongs = computed(() => favoritesStore.favoriteSongs)
const favoriteCount = computed(() => favoritesStore.favoriteCount)

const headerBackdropUrl = computed(() => {
  if (favoriteSongs.value.length > 0) {
    return favoriteSongs.value[0].thumbnail
  }
  return ''
})

const totalDuration = computed(() => {
  if (favoriteSongs.value.length === 0) return ''
  const total = favoriteSongs.value.reduce((sum, song) => sum + (song.duration || 0), 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
})

const filteredSongs = computed(() => {
  let songs = [...favoriteSongs.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    songs = songs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query)
    )
  }

  songs.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'addedAt') {
      comparison = new Date(a.addedAt || 0) - new Date(b.addedAt || 0)
    } else if (sortBy.value === 'title') {
      comparison = a.title.localeCompare(b.title)
    } else if (sortBy.value === 'artist') {
      comparison = a.artist.localeCompare(b.artist)
    } else if (sortBy.value === 'duration') {
      comparison = (a.duration || 0) - (b.duration || 0)
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return songs
})

onMounted(async () => {
  await favoritesStore.loadFavorites()
  isLoading.value = false
})

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function playSong(song) {
  player.setQueue(filteredSongs.value, filteredSongs.value.indexOf(song))
  player.playTrack(song)
}

function playAll() {
  if (filteredSongs.value.length > 0) {
    player.setQueue(filteredSongs.value, 0)
    player.playTrack(filteredSongs.value[0])
  }
}

function shuffleAll() {
  if (filteredSongs.value.length > 0) {
    const shuffled = [...filteredSongs.value].sort(() => Math.random() - 0.5)
    player.setQueue(shuffled, 0)
    player.playTrack(shuffled[0])
  }
}

function goBack() {
  router.back()
}

function goToSearch() {
  router.push('/search')
}
</script>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

/* Glassmorphism Header */
.view-header {
  position: relative;
  border-radius: var(--radius-xl);
  padding: 40px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  box-shadow: var(--shadow-lg);
}

.header-backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(80px) brightness(0.5) saturate(1.3);
  transform: scale(1.3);
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 1;
  min-width: 0;
}

.header-cover-wrap {
  position: relative;
  flex-shrink: 0;
}

.header-icon-glass {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
  position: relative;
  animation: float 6s ease-in-out infinite;
}

.header-icon-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.header-icon-glass::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: calc(var(--radius-lg) + 4px);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  z-index: -1;
  opacity: 0.4;
  filter: blur(12px);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.header-icon-glass svg {
  width: 48px;
  height: 48px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.header-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
}

.view-type-tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary);
  margin-bottom: 6px;
  display: inline-block;
}

.page-title {
  margin: 0 0 6px 0;
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

[data-theme="light"] .page-title {
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.subtitle .highlight {
  color: var(--color-primary);
  font-weight: 700;
  font-family: var(--font-mono);
}

.duration-stat {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.header-actions {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.play-all-btn,
.shuffle-btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-normal);
  letter-spacing: 0.01em;
}

.play-all-btn {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-glow);
}

.play-all-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-intense);
}

.shuffle-btn {
  background: var(--glass-bg-light);
  color: var(--color-text);
  border: var(--glass-border);
  backdrop-filter: blur(12px);
}

.shuffle-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.play-all-btn svg,
.shuffle-btn svg {
  width: 16px;
  height: 16px;
}

/* Filter & Search Strip */
.filter-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 14px 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.search-box {
  flex: 1;
  max-width: 340px;
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0 16px;
  gap: 10px;
  height: 42px;
  transition: all var(--transition-fast);
}

.search-box.focused,
.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  max-width: 400px;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0;
  width: 100%;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.clear-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.sort-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-select {
  appearance: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 8px 32px 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-fast);
  min-width: 130px;
}

.sort-select:hover {
  border-color: var(--color-text-secondary);
}

.sort-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.select-chevron {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.direction-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.direction-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.direction-btn svg {
  width: 16px;
  height: 16px;
}

/* Loading Skeleton */
.loading-state {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 12px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  position: relative;
  overflow: hidden;
}

.skeleton-row::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer 1.5s infinite;
}

[data-theme="light"] .skeleton-row::after {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
}

.skeleton-thumb {
  width: 72px;
  height: 72px;
  background: var(--color-surface-hover);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  width: 40%;
  height: 14px;
  background: var(--color-surface-hover);
  border-radius: 4px;
}

.skeleton-artist {
  width: 25%;
  height: 10px;
  background: var(--color-surface-hover);
  border-radius: 4px;
}

.skeleton-dur {
  width: 40px;
  height: 10px;
  background: var(--color-surface-hover);
  border-radius: 4px;
  flex-shrink: 0;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Empty State */
.empty-state {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.empty-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.08;
  pointer-events: none;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.empty-icon-wrap svg {
  width: 36px;
  height: 36px;
  color: var(--color-primary);
}

.empty-state h2 {
  margin: 0 0 10px 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.empty-state p {
  margin: 0 0 28px 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  max-width: 380px;
  line-height: 1.5;
}

.browse-btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-glow);
}

.browse-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-intense);
}

.browse-btn svg {
  width: 16px;
  height: 16px;
}

/* Empty Search State */
.empty-search-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.empty-search-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.35;
}

.empty-search-state h3 {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-search-state p {
  margin: 0;
  font-size: 0.85rem;
}

/* Favorites List */
.favorites-list-container {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: var(--shadow-md);
}

.list-headers {
  display: grid;
  align-items: center;
  gap: 16px;
  padding: 8px 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
  grid-template-columns: 32px 56px 2fr 1.2fr 140px 60px;
}

.list-headers span {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.header-col-rank {
  text-align: center;
}

.header-col-thumb {
  display: block;
}

.header-col-title {
  text-align: left;
}

.header-col-artist {
  text-align: left;
}

.header-col-actions {
  text-align: center;
}

.header-col-dur {
  text-align: right;
}

@media (max-width: 900px) {
  .list-headers {
    grid-template-columns: 32px 56px 1fr 140px 60px;
    padding: 8px 16px;
  }
  .header-col-artist {
    display: none;
  }
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.favorite-track-card {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-icon-glass {
    width: 90px;
    height: 90px;
  }

  .header-icon-glass svg {
    width: 36px;
    height: 36px;
  }

  .page-title {
    font-size: 2.25rem;
  }

  .header-actions {
    width: 100%;
    gap: 8px;
  }

  .play-all-btn,
  .shuffle-btn {
    flex: 1;
    padding: 10px 16px;
    justify-content: center;
    font-size: 0.8rem;
  }

  .filter-strip {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    max-width: none !important;
  }

  .sort-controls {
    justify-content: space-between;
  }

  .list-headers {
    display: none;
  }
}
</style>
