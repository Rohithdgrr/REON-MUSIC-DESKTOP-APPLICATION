<template>
  <div class="downloads-view">
    <div class="view-header">
      <div class="header-top-row">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
      </div>
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
        <div class="header-info">
          <h1>Downloads</h1>
          <p class="subtitle">{{ downloadCount }} songs available offline</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading downloads...</p>
    </div>

    <div v-else-if="downloadCount === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
      <h2>No downloads yet</h2>
      <p>Download songs to listen offline</p>
      <button @click="goToSearch" class="browse-btn">Browse Music</button>
    </div>

    <div v-else class="downloads-list">
      <RecycleScroller
        :items="downloadedSongs"
        :item-size="80"
        key-field="id"
        class="scroller"
        v-slot="{ item }"
      >
        <div class="download-item">
          <TrackCard :track="item" @play="playSong" />
          <button class="remove-btn" @click="handleRemove(item)" title="Remove download">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDownloadsStore } from '../stores/downloads.js'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'

const router = useRouter()
const downloadsStore = useDownloadsStore()
const player = usePlayerStore()

const downloadedSongs = computed(() => downloadsStore.downloadedSongs)
const downloadCount = computed(() => downloadsStore.downloadCount)
const isLoading = computed(() => downloadsStore.isLoading)

onMounted(() => {
  downloadsStore.loadDownloads()
})

function goBack() {
  router.back()
}

function playSong(song) {
  const queue = downloadedSongs.value
  const index = queue.findIndex(s => s.videoId === song.videoId)
  player.setQueue(queue, index >= 0 ? index : 0)
  player.playTrack(song)
}

async function handleRemove(song) {
  if (confirm('Remove this download?')) {
    await downloadsStore.removeDownload(song.id)
  }
}

function goToSearch() {
  router.push('/search')
}
</script>

<style scoped>
.downloads-view {
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
  background: linear-gradient(135deg, #10b981, #059669);
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
  padding: calc(var(--space-xl) * 2);
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

.downloads-list {
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  flex: 1;
  min-height: 200px;
}

.downloads-list .scroller {
  height: calc(100vh - 280px);
}

.downloads-list .track-card {
  margin: 0;
}

.download-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.download-item > :first-child {
  flex: 1;
}

.remove-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
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
}

@media (max-width: 480px) {
  .view-header { padding: 20px; }
  .header-icon { width: 52px; height: 52px; }
  .header-icon svg { width: 26px; height: 26px; }
  .header-info h1 { font-size: 1.7rem; }
  .downloads-list .scroller { height: calc(100vh - 260px); }
}
</style>
