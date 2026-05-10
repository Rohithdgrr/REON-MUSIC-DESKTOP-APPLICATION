<template>
  <div class="stats-view">
    <div class="view-header">
      <h1>Your Stats</h1>
      <p class="subtitle">Insights into your listening habits</p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading stats...</p>
    </div>

    <div v-else>
      <div v-if="loadError" class="error-banner">
        {{ loadError }}
      </div>

      <!-- Overview Cards -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-value">{{ stats.totalSongs }}</div>
          <div class="stat-label">Total Songs</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ stats.totalHours }}</div>
          <div class="stat-label">Hours Played</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎤</div>
          <div class="stat-value">{{ stats.totalArtists }}</div>
          <div class="stat-label">Artists</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📀</div>
          <div class="stat-value">{{ stats.totalPlaylists }}</div>
          <div class="stat-label">Playlists</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">▶️</div>
          <div class="stat-value">{{ stats.totalPlays }}</div>
          <div class="stat-label">Total Plays</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">❤️</div>
          <div class="stat-value">{{ stats.totalFavorites }}</div>
          <div class="stat-label">Favorites</div>
        </div>
      </div>

      <!-- Top Songs -->
      <section class="stats-section">
        <h2>Most Played Songs</h2>
        <div v-if="topSongs.length === 0" class="empty-message">
          No play history yet
        </div>
        <div v-else class="top-list">
          <div v-for="(song, index) in topSongs" :key="song.id" class="top-item" @click="playSong(song)">
            <span class="rank">#{{ index + 1 }}</span>
            <img v-if="song.thumbnail_url" :src="song.thumbnail_url" class="item-thumb" />
            <div v-else class="thumb-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
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
        <div v-if="topArtists.length === 0" class="empty-message">
          No play history yet
        </div>
        <div v-else class="artist-grid">
          <div v-for="(artist, index) in topArtists" :key="artist.name" class="artist-card">
            <div class="artist-rank">#{{ index + 1 }}</div>
            <div class="artist-name">{{ artist.name }}</div>
            <div class="artist-plays">{{ artist.playCount }} plays</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getElectronApi, waitForElectronApi } from '../utils/electronApi.js'
import { usePlayerStore } from '../stores/player.js'
import { normalizeTrack } from '../utils/trackNormalizer.js'

const player = usePlayerStore()
const isLoading = ref(true)
const loadError = ref('')
const stats = ref({
  totalSongs: 0,
  totalHours: 0,
  totalArtists: 0,
  totalPlaylists: 0,
  totalPlays: 0,
  totalFavorites: 0
})
const topSongs = ref([])
const topArtists = ref([])

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  try {
    loadError.value = ''
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const [statsResult, songsResult, artistsResult] = await Promise.allSettled([
      electron.sqlite.getStats(),
      electron.sqlite.getTopSongs(50),
      electron.sqlite.getTopArtists(20)
    ])
    
    if (statsResult.status === 'fulfilled' && statsResult.value.success) {
      stats.value = statsResult.value.data
    }
    
    if (songsResult.status === 'fulfilled' && songsResult.value.success) {
      topSongs.value = songsResult.value.data
    }
    
    if (artistsResult.status === 'fulfilled' && artistsResult.value.success) {
      topArtists.value = artistsResult.value.data
    }

    const failures = [statsResult, songsResult, artistsResult].filter(result => result.status === 'rejected' || !result.value?.success)
    if (failures.length > 0) {
      loadError.value = 'Some stats could not be loaded. The available numbers are still shown.'
    }
  } catch (err) {
    loadError.value = 'Failed to load stats.'
    console.error('Failed to load stats:', err)
  } finally {
    isLoading.value = false
  }
}

function playSong(song) {
  const track = normalizeTrack(song)
  player.playTrack(track)
}
</script>

<style scoped>
.stats-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: var(--space-xl);
}

.view-header h1 {
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

.error-banner {
  margin-bottom: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.18);
  color: var(--color-text);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  transition: all var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.stats-section {
  margin-bottom: var(--space-xl);
}

.stats-section h2 {
  margin: 0 0 var(--space-lg) 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-message {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.top-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.top-item:hover {
  background: var(--color-surface-hover);
  transform: translateX(4px);
}

.rank {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 40px;
}

.item-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.thumb-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-placeholder svg {
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.artist-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  transition: all var(--transition-fast);
}

.artist-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.artist-rank {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.artist-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-plays {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
