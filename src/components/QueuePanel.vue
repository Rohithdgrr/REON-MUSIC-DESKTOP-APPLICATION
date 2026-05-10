<template>
  <div class="queue-panel" :class="{ open: isOpen }">
    <div class="queue-header">
      <h3 class="queue-title">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
        Queue
      </h3>
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <div class="queue-stats">
      <span>{{ queue.length }} songs</span>
      <span>•</span>
      <span>{{ totalDuration }}</span>
    </div>

    <div v-if="queue.length === 0" class="empty-queue">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2z"/>
      </svg>
      <p>No songs in queue</p>
      <p class="empty-subtitle">Add songs to start playing</p>
    </div>

    <div v-else class="queue-list">
      <div class="now-playing-section" v-if="currentTrack">
        <div class="section-label">Now Playing</div>
        <div class="queue-item current">
          <div class="item-thumbnail">
            <img v-if="currentTrack.thumbnail" :src="currentTrack.thumbnail" alt="">
            <div v-else class="thumbnail-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="playing-indicator">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          </div>
          <div class="item-info">
            <div class="item-title">{{ currentTrack.title }}</div>
            <div class="item-artist">{{ currentTrack.artist }}</div>
          </div>
          <div class="item-duration">{{ formatDuration(currentTrack.duration) }}</div>
        </div>
      </div>

      <div class="next-up-section" v-if="upcomingSongs.length > 0">
        <div class="section-label">Next Up</div>
        <draggable
          v-model="upcomingSongs"
          @end="onReorder"
          item-key="videoId"
          class="draggable-list"
          handle=".drag-handle"
        >
          <template #item="{ element, index }">
            <div class="queue-item" :class="{ playing: isPlaying(index) }">
              <div class="drag-handle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <div class="item-thumbnail" @click="playFromQueue(index)">
                <img v-if="element.thumbnail" :src="element.thumbnail" alt="">
                <div v-else class="thumbnail-placeholder">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div class="play-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ element.title }}</div>
                <div class="item-artist">{{ element.artist }}</div>
              </div>
              <div class="item-actions">
                <button class="action-btn" @click="removeFromQueue(index)" title="Remove">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div class="item-duration">{{ formatDuration(element.duration) }}</div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <div class="queue-actions" v-if="queue.length > 0">
      <button class="action-button" @click="saveAsPlaylist">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Save as Playlist
      </button>
      <button class="action-button danger" @click="clearQueue">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        Clear Queue
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const player = usePlayerStore()
const { queue, currentIndex, currentTrack } = storeToRefs(player)

const upcomingSongs = computed({
  get: () => queue.value.slice(currentIndex.value + 1),
  set: (value) => {
    // Update queue with reordered songs
    const newQueue = [
      ...queue.value.slice(0, currentIndex.value + 1),
      ...value
    ]
    player.setQueue(newQueue, currentIndex.value)
  }
})

const totalDuration = computed(() => {
  const total = queue.value.reduce((sum, track) => sum + (track.duration || 0), 0)
  return formatDuration(total)
})

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function isPlaying(index) {
  return index === currentIndex.value
}

function playFromQueue(index) {
  const actualIndex = currentIndex.value + 1 + index
  const track = queue.value[actualIndex]
  if (track) {
    player.setQueue(queue.value, actualIndex)
    player.playTrack(track)
  }
}

function removeFromQueue(index) {
  const actualIndex = currentIndex.value + 1 + index
  const newQueue = queue.value.filter((_, i) => i !== actualIndex)
  const newIndex = actualIndex > currentIndex.value ? currentIndex.value : currentIndex.value - 1
  player.setQueue(newQueue, newIndex)
}

function onReorder() {
  // Reordering is handled by the computed setter
}

function clearQueue() {
  if (confirm('Clear entire queue?')) {
    player.clearQueue()
  }
}

function saveAsPlaylist() {
  const name = prompt('Enter playlist name:')
  if (name) {
    // TODO: Implement save queue as playlist
    console.log('Save queue as playlist:', name)
  }
}
</script>

<style scoped>
.queue-panel {
  position: fixed;
  right: -400px;
  top: 0;
  bottom: 0;
  width: 380px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-left: var(--glass-border);
  box-shadow: -8px 0 30px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  transition: right var(--transition-spring);
  z-index: 200;
}

.queue-panel.open {
  right: 0;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.queue-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.queue-title svg {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
}

.close-btn:hover {
  background: var(--color-surface-hover);
}

.queue-stats {
  padding: var(--space-md) var(--space-lg);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  display: flex;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
  padding: 0 var(--space-sm);
}

.now-playing-section,
.next-up-section {
  margin-bottom: var(--space-lg);
}

.queue-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-bounce);
  cursor: pointer;
  border: 1px solid transparent;
}

.queue-item:hover {
  background: var(--color-surface-hover);
  transform: translateX(4px);
  border-color: rgba(255,255,255,0.05);
}

.queue-item.current {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.1), transparent);
  border: 1px solid rgba(249, 115, 22, 0.2);
  box-shadow: inset 3px 0 0 var(--color-primary);
}

.drag-handle {
  width: 20px;
  height: 20px;
  cursor: grab;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle svg {
  width: 100%;
  height: 100%;
}

.item-thumbnail {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-placeholder svg {
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
}

.playing-indicator {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.bar {
  width: 3px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 2px;
  animation: pulse 0.8s ease-in-out infinite;
}

.bar:nth-child(2) {
  animation-delay: 0.2s;
}

.bar:nth-child(3) {
  animation-delay: 0.4s;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.item-thumbnail:hover .play-overlay {
  opacity: 1;
}

.play-overlay svg {
  width: 20px;
  height: 20px;
  color: white;
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

.item-actions {
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.queue-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.action-btn:hover {
  background: var(--color-surface-active);
}

.action-btn:hover svg {
  color: var(--color-text);
}

.item-duration {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.empty-queue {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-text-muted);
  height: 100%;
}

.empty-queue svg {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  opacity: 0.3;
}

.empty-subtitle {
  font-size: 0.875rem;
  margin-top: var(--space-xs);
}

.queue-actions {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-sm);
}

.action-button {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  transition: all var(--transition-fast);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.action-button.danger:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

.draggable-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

@media (max-width: 768px) {
  .queue-panel {
    width: 100%;
    right: -100%;
    border-radius: 0;
  }
}
</style>
