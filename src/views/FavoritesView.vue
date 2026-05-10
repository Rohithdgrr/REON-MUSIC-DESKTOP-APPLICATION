<template>
  <div class="favorites-view">
    <div class="view-header">
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="header-info">
          <h1>Favorites</h1>
          <p class="subtitle">{{ favoriteCount }} songs you love</p>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="favoriteCount > 0" @click="playAll" class="play-all-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play All
        </button>
        <button v-if="favoriteCount > 0" @click="shuffleAll" class="shuffle-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
          Shuffle
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading favorites...</p>
    </div>

    <div v-else-if="favoriteCount === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <h2>No favorites yet</h2>
      <p>Songs you favorite will appear here</p>
      <button @click="goToSearch" class="browse-btn">
        Browse Music
      </button>
    </div>

    <div v-else class="favorites-list">
      <TrackCard
        v-for="song in favoriteSongs"
        :key="song.videoId"
        :track="song"
        @play="playSong"
      />
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

const favoriteSongs = computed(() => favoritesStore.favoriteSongs)
const favoriteCount = computed(() => favoritesStore.favoriteCount)

onMounted(async () => {
  await favoritesStore.loadFavorites()
  isLoading.value = false
})

function playSong(song) {
  player.setQueue(favoriteSongs.value, favoriteSongs.value.indexOf(song))
  player.playTrack(song)
}

function playAll() {
  if (favoriteSongs.value.length > 0) {
    player.setQueue(favoriteSongs.value, 0)
    player.playTrack(favoriteSongs.value[0])
  }
}

function shuffleAll() {
  if (favoriteSongs.value.length > 0) {
    const shuffled = [...favoriteSongs.value].sort(() => Math.random() - 0.5)
    player.setQueue(shuffled, 0)
    player.playTrack(shuffled[0])
  }
}

function goToSearch() {
  router.push('/search')
}
</script>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.header-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
}

.header-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.header-info h1 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.play-all-btn,
.shuffle-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.play-all-btn {
  background: var(--color-primary);
  color: white;
}

.play-all-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.shuffle-btn {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.shuffle-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.play-all-btn svg,
.shuffle-btn svg {
  width: 16px;
  height: 16px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  gap: var(--space-md);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) * 2;
  text-align: center;
}

.empty-state svg {
  width: 80px;
  height: 80px;
  color: var(--color-text-muted);
  opacity: 0.3;
  margin-bottom: var(--space-lg);
}

.empty-state h2 {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-state p {
  margin: 0 0 var(--space-lg) 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.browse-btn {
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.browse-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icon {
    width: 60px;
    height: 60px;
  }

  .header-icon svg {
    width: 30px;
    height: 30px;
  }

  .header-info h1 {
    font-size: 2rem;
  }

  .header-actions {
    width: 100%;
  }

  .play-all-btn,
  .shuffle-btn {
    flex: 1;
  }
}
</style>
