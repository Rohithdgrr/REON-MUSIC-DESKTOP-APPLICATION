<template>
  <div class="recently-played-view">
    <div class="view-header">
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
        </div>
        <div class="header-info">
          <h1>Recently Played</h1>
          <p class="subtitle">Your listening history</p>
        </div>
      </div>
      <button v-if="history.length > 0" @click="clearHistory" class="clear-btn">
        Clear History
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading history...</p>
    </div>

    <div v-else-if="history.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
      </svg>
      <h2>No history yet</h2>
      <p>Songs you play will appear here</p>
    </div>

    <div v-else class="timeline">
      <div v-for="group in groupedHistory" :key="group.label" class="timeline-group">
        <h3 class="timeline-date">{{ group.label }}</h3>
        <div class="timeline-songs">
          <div v-for="item in group.items" :key="item.id" class="history-item" @click="playSong(item)">
            <div class="item-time">{{ formatTime(item.played_at) }}</div>
            <div class="item-thumb">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" alt="">
              <div v-else class="thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-artist">{{ item.artist }}</div>
            </div>
            <FavoriteButton :song="{ videoId: item.video_id, title: item.title, artist: item.artist, thumbnail: item.thumbnail_url }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getElectronApi, waitForElectronApi } from '../utils/electronApi.js'
import { usePlayerStore } from '../stores/player.js'
import FavoriteButton from '../components/FavoriteButton.vue'

const player = usePlayerStore()
const history = ref([])
const isLoading = ref(true)

const groupedHistory = computed(() => {
  const groups = {}
  const now = new Date()
  
  history.value.forEach(item => {
    const date = new Date(item.played_at)
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    let label
    if (diff === 0) label = 'Today'
    else if (diff === 1) label = 'Yesterday'
    else if (diff < 7) label = 'This Week'
    else if (diff < 30) label = 'This Month'
    else label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  })
  
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

onMounted(async () => {
  await loadHistory()
})

async function loadHistory() {
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    const result = await electron.sqlite.getHistory()
    
    if (result.success) {
      history.value = result.data
    }
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    isLoading.value = false
  }
}

async function clearHistory() {
  if (!confirm('Clear all listening history?')) return
  
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    const result = await electron.sqlite.clearHistory()
    
    if (result.success) {
      history.value = []
    }
  } catch (err) {
    console.error('Failed to clear history:', err)
  }
}

function playSong(item) {
  const song = {
    videoId: item.video_id,
    title: item.title,
    artist: item.artist,
    thumbnail: item.thumbnail_url
  }
  player.playTrack(song)
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
</script>

<style scoped>
.recently-played-view {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.clear-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-error);
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 0.2);
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
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.timeline-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.timeline-date {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  padding-left: var(--space-sm);
}

.timeline-songs {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.history-item:hover {
  background: var(--color-surface-hover);
}

.item-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 60px;
}

.item-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
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

  .clear-btn {
    width: 100%;
  }

  .item-time {
    min-width: 50px;
    font-size: 0.7rem;
  }
}
</style>
