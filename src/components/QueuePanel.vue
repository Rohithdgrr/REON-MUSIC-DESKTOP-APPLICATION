<template>
  <div class="queue-panel" :class="{ open: isOpen }" :style="{ width: panelWidth + 'px', transform: isOpen ? 'translateX(0)' : `translateX(100%)` }">
    <div class="resize-handle" @mousedown="startResize" title="Drag to resize"></div>
    <div class="queue-header">
      <h3 class="queue-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Queue
      </h3>
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="queue-stats">
      <span>{{ queue.length }} songs</span>
      <span>•</span>
      <span>{{ totalDuration }}</span>
    </div>

    <div v-if="queue.length === 0" class="empty-queue">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
      </svg>
      <p>No songs in queue</p>
      <p class="empty-subtitle">Add songs to start playing</p>
    </div>

    <div v-else class="queue-list">
      <div class="now-playing-section" v-if="currentTrack">
        <div class="section-label">
          <svg class="now-playing-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Now Playing
        </div>
        <div class="queue-item current">
          <div class="item-thumbnail">
            <img v-if="currentTrack.thumbnail && !brokenImages.has(currentTrack.thumbnail)" :src="currentTrack.thumbnail" @error="handleImageError(currentTrack.thumbnail)" alt="">
            <div v-else class="thumbnail-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
                  <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
                </svg>
              </div>
              <div class="item-thumbnail" @click="playFromQueue(index)">
                <img v-if="element.thumbnail && !brokenImages.has(element.thumbnail)" :src="element.thumbnail" @error="handleImageError(element.thumbnail)" alt="">
                <div v-else class="thumbnail-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
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
      <div class="save-playlist-section" v-if="showSaveDialog">
        <input v-model="playlistName" ref="saveInput" placeholder="Enter playlist name..." @keyup.enter="confirmSave" @keyup.esc="showSaveDialog = false" class="save-input" />
        <div class="save-actions">
          <button class="action-button primary small" @click="confirmSave" :disabled="!playlistName.trim()">Save</button>
          <button class="action-button small" @click="showSaveDialog = false">Cancel</button>
        </div>
      </div>
      <button v-else class="action-button" @click="startSave">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Save as Playlist
      </button>
      <button class="action-button danger" @click="clearQueue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Clear Queue
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { useNotifications } from '../composables/useNotifications.js'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'resize'])

const player = usePlayerStore()
const library = useLibraryStore()
const { queue, currentIndex, currentTrack } = storeToRefs(player)

const brokenImages = ref(new Set())
function handleImageError(url) {
  if (url) brokenImages.value.add(url)
}

const { showNotification } = useNotifications()
const showSaveDialog = ref(false)
const playlistName = ref('')
const saveInput = ref(null)

function startSave() {
  playlistName.value = ''
  showSaveDialog.value = true
  nextTick(() => saveInput.value?.focus())
}

async function confirmSave() {
  const name = playlistName.value.trim()
  if (!name) return
  showSaveDialog.value = false
  const result = await library.createPlaylist(name)
  if (result.success) {
    for (let i = 0; i < queue.value.length; i++) {
      const track = queue.value[i]
      await library.addSong({
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      })
      const songId = library.songs.find(s => s.video_id === track.videoId)?.id
      if (songId) {
        await library.addSongToPlaylist(result.data.id, songId, i)
      }
    }
    showNotification({ title: 'Playlist Saved', message: `"${name}" with ${queue.value.length} songs`, type: 'success' })
  }
}

const panelWidth = ref(380)
const MIN_WIDTH = 300
const MAX_WIDTH = 600
let isResizing = false
let startX = 0
let startWidth = 0

function startResize(e) {
  isResizing = true
  startX = e.clientX
  startWidth = panelWidth.value
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  e.preventDefault()
}

function onResize(e) {
  if (!isResizing) return
  const delta = startX - e.clientX
  const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
  panelWidth.value = newWidth
  emit('resize', newWidth)
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

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

</script>

<style scoped>
.queue-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-left: var(--glass-border);
  box-shadow: -8px 0 30px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-spring);
  z-index: 200;
}

.resize-handle {
  position: absolute;
  left: -3px;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.2s ease;
}

.resize-handle:hover,
.resize-handle:active {
  background: var(--color-primary);
  opacity: 0.5;
}

.queue-panel.open {
  right: 0;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.queue-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: var(--font-bold);
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.queue-title svg {
  width: 22px;
  height: 22px;
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
  padding: 12px 24px;
  font-size: 0.8rem;
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  letter-spacing: 0.02em;
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
  padding: 0 4px;
}

.now-playing-icon {
  width: 14px;
  height: 14px;
  color: var(--color-primary);
}

.now-playing-section,
.next-up-section {
  margin-bottom: 24px;
}

.now-playing-section:last-child,
.next-up-section:last-child {
  margin-bottom: 0;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-bounce);
  cursor: pointer;
  border: 1px solid transparent;
  min-height: 72px;
}

.queue-item > .item-thumbnail {
  flex-shrink: 0;
}

.queue-item > .item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.queue-item > .item-duration {
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}

.queue-item > .item-actions {
  flex-shrink: 0;
}

.queue-item > .drag-handle {
  flex-shrink: 0;
}

.queue-item:hover {
  background: var(--color-surface-hover);
  transform: translateX(4px);
  border-color: rgba(255,255,255,0.05);
}

.queue-item.current {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(236, 72, 153, 0.04));
  border: 1px solid rgba(236, 72, 153, 0.25);
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.15), inset 0 0 0 1px rgba(236, 72, 153, 0.1);
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
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.queue-item:hover .item-thumbnail img {
  transform: scale(1.05);
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
  font-size: 0.9rem;
  font-weight: var(--font-semibold);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.queue-item.current .item-title {
  color: var(--color-primary);
}

.item-artist {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-top: 2px;
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
  font-size: 0.78rem;
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
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

.save-playlist-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.save-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.save-actions {
  display: flex;
  gap: 8px;
}

.action-button.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.action-button.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-button.small {
  flex: 0 1 auto;
  padding: 6px 16px;
  font-size: 0.78rem;
}

.queue-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 10px;
}

.action-button {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all var(--transition-fast);
  letter-spacing: 0.01em;
}

.action-button svg {
  width: 15px;
  height: 15px;
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
    width: 100% !important;
    transform: translateX(100%);
    border-radius: 0;
  }
  
  .queue-panel.open {
    transform: translateX(0);
  }
  
  .resize-handle {
    display: none;
  }
}
</style>
