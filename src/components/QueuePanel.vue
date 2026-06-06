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
        <span v-if="player.isShuffled" class="shuffle-badge" title="Shuffle is on">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y3="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
          Shuffle
        </span>
      </h3>
      <button class="close-btn" @click="$emit('close')" aria-label="Close queue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div v-if="queueCount > 0" class="queue-stats">
      <span><strong>{{ queueCount }}</strong> songs</span>
      <span>•</span>
      <span>{{ totalDurationLong }} total</span>
      <span>•</span>
      <span>{{ currentTrackPosition }} of {{ queueCount }} playing</span>
    </div>

    <div v-if="queueCount === 0" class="empty-queue">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
      </svg>
      <p>No songs in queue</p>
      <p class="empty-subtitle">Add songs to start playing</p>
      <button class="browse-btn" @click="$emit('close'); $router.push('/search')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Browse Music
      </button>
    </div>

    <div v-else class="queue-list">
      <div class="now-playing-section" v-if="track.videoId">
        <div class="section-label">
          <svg class="now-playing-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Now Playing
        </div>
        <div class="queue-item current">
          <div class="item-thumbnail">
            <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" alt="">
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
            <div class="item-title">{{ track.title }}</div>
            <div class="item-artist">{{ track.artist }}</div>
            <div class="mini-progress" v-if="player.progressPercent > 0">
              <div class="mini-progress-fill" :style="{ width: player.progressPercent + '%' }"></div>
            </div>
          </div>
          <div class="item-duration">{{ formatDuration(track.duration) }}</div>
        </div>
      </div>

      <div class="next-up-section" v-if="upcomingSongs.length > 0">
        <div class="section-label">Next Up <span class="count-pill">{{ upcomingSongs.length }}</span></div>
        <draggable
          v-model="upcomingSongs"
          @end="onReorder"
          item-key="videoId"
          class="draggable-list"
          handle=".drag-handle"
          role="listbox"
          :aria-label="`Up next: ${upcomingSongs.length} songs`"
        >
          <template #item="{ element, index }">
            <div
              class="queue-item"
              :class="{ playing: isPlaying(index) }"
              role="option"
              :aria-selected="isPlaying(index)"
              :tabindex="0"
              @keydown="onItemKeydown($event, element, index)"
              @focus="focusedIndex = index"
              @blur="focusedIndex = -1"
              :data-focused="focusedIndex === index"
            >
              <div class="drag-handle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
                  <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
                </svg>
              </div>
              <div class="item-thumbnail" @click="playQueueItem(element)" :aria-label="`Play ${element.title}`">
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
              <div class="item-info" @click="playQueueItem(element)">
                <div class="item-title">{{ element.title }}</div>
                <div class="item-artist">{{ element.artist }}</div>
                <div v-if="player.getItemMeta(element.videoId)?.sourceName" class="source-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                  </svg>
                  {{ player.getItemMeta(element.videoId).sourceName }}
                </div>
              </div>
              <div class="item-actions">
                <button class="action-btn move-top" @click="moveToTop(index)" :disabled="index === 0" title="Move to top" aria-label="Move to top of queue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
                <button class="action-btn" @click="removeFromQueue(index)" title="Remove" aria-label="Remove from queue">
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

      <div class="history-section" v-if="library.history && library.history.length > 0">
        <button class="section-toggle" @click="showHistory = !showHistory" :aria-expanded="showHistory">
          <svg class="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)' }">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          Recently Played
          <span class="count-pill">{{ library.history.length }}</span>
        </button>
        <transition name="history-fade">
          <div v-if="showHistory" class="history-list">
            <div
              v-for="(item, i) in library.history.slice(0, 8)"
              :key="`${item.video_id || item.videoId}-${i}`"
              class="history-item"
            >
              <div class="item-thumbnail small">
                <img v-if="(item.thumbnail_url || item.thumbnail) && !brokenImages.has(item.thumbnail_url || item.thumbnail)" :src="item.thumbnail_url || item.thumbnail" @error="handleImageError(item.thumbnail_url || item.thumbnail)" alt="">
                <div v-else class="thumbnail-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title || 'Unknown' }}</div>
                <div class="item-artist">{{ item.artist || 'Unknown' }}</div>
              </div>
              <div class="item-actions">
                <button class="action-btn primary" @click="playHistoryNow(item)" title="Play now" aria-label="Play this track next">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button class="action-btn" @click="addHistoryToQueue(item)" title="Add to queue" aria-label="Add to queue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="queue-actions" v-if="queueCount > 0">
      <button class="action-button" @click="showSaveModal = true">
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

    <CreatePlaylistModal
      v-model:show="showSaveModal"
      title="Save Queue as Playlist"
      action-label="Save"
      placeholder="Queue backup"
      @created="onSaveCreated"
    />
  </div>
</template>

<script setup>
import { computed, ref, onUnmounted, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import draggable from 'vuedraggable'
import CreatePlaylistModal from './CreatePlaylistModal.vue'
import { useQueue } from '../composables/useQueue.js'
import { formatDuration } from '../utils/queueFormat.js'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'resize'])

const player = usePlayerStore()
const library = useLibraryStore()
const { queue, currentIndex, currentTrack, isShuffled } = storeToRefs(player)

const {
  brokenImages,
  handleImageError,
  track,
  queueCount,
  currentTrackPosition,
  upcomingSongs,
  totalDurationLong,
  playQueueItem,
  removeFromQueue,
  moveToTop,
  clearQueue,
  addHistoryToQueue,
  playHistoryNow
} = useQueue()

const showHistory = ref(false)
const showSaveModal = ref(false)
const focusedIndex = ref(-1)

function isPlaying(index) {
  return index === currentIndex.value
}

function onReorder() {
  // Reordering is handled by the computed setter
}

function onItemKeydown(e, item, index) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    playQueueItem(item)
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    removeFromQueue(index)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (index > 0) moveToTop(index)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (index < upcomingSongs.value.length - 1) {
      const list = upcomingSongs.value
      const temp = list[index]
      const newList = [...list]
      newList[index] = newList[index + 1]
      newList[index + 1] = temp
      upcomingSongs.value = newList
    }
  }
}

async function onSaveCreated(playlist) {
  // The CreatePlaylistModal already calls createPlaylist but does NOT
  // copy the queue contents. We do the bulk copy here.
  if (!playlist?.id) return
  for (let i = 0; i < upcomingSongs.value.length; i++) {
    const t = upcomingSongs.value[i]
    await library.addSong({
      videoId: t.videoId,
      title: t.title,
      artist: t.artist,
      thumbnail: t.thumbnail || '',
      duration: t.duration || 0
    })
    const songId = library.songs.find((s) => s.video_id === t.videoId)?.id
    if (songId) {
      await library.addSongToPlaylist(playlist.id, songId, i)
    }
  }
}

// Resize logic
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

onMounted(() => {
  // Pre-load history if not loaded
  if (!library.history || library.history.length === 0) {
    library.loadHistory().catch(() => {})
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})
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
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
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

.queue-title svg:first-child {
  width: 22px;
  height: 22px;
  color: var(--color-primary);
}

.shuffle-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.shuffle-badge svg {
  width: 12px;
  height: 12px;
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
  color: var(--color-text-muted);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.queue-stats {
  padding: 12px 24px;
  font-size: 0.78rem;
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.queue-stats strong {
  color: var(--color-primary);
  font-weight: 700;
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

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.18);
  color: var(--color-primary);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-left: auto;
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
  border-left: 3px solid transparent;
  position: relative;
  outline: none;
}

.queue-item[data-focused="true"] {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.25);
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
  border-left: 3px solid var(--color-primary);
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

.item-thumbnail.small {
  width: 40px;
  height: 40px;
  border-radius: 8px;
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

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
  padding: 1px 6px;
  border-radius: var(--radius-xs);
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-primary);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-badge svg {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
}

.mini-progress {
  margin-top: 6px;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent, #ec4899));
  border-radius: var(--radius-full);
  transition: width 0.3s linear;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.queue-item:hover .item-actions,
.queue-item[data-focused="true"] .item-actions {
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
  color: var(--color-text-muted);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-surface-active);
  color: var(--color-text);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
}

.action-btn.primary:hover {
  background: var(--color-primary-dark);
  color: white;
}

.action-btn.primary svg {
  width: 14px;
  height: 14px;
}

.action-btn.move-top:hover:not(:disabled) {
  color: var(--color-primary);
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
  gap: 12px;
}

.empty-queue svg {
  width: 64px;
  height: 64px;
  margin-bottom: 4px;
  opacity: 0.3;
}

.empty-queue p {
  margin: 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  opacity: 0.7;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.browse-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.browse-btn svg {
  width: 16px;
  height: 16px;
  opacity: 1;
}

.queue-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 10px;
  flex-shrink: 0;
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

/* History section */
.history-section {
  margin-top: 24px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.section-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 8px 4px;
  width: 100%;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.section-toggle:hover {
  color: var(--color-text);
}

.history-icon {
  width: 12px;
  height: 12px;
  transition: transform var(--transition-fast);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  min-height: 52px;
}

.history-item:hover {
  background: var(--color-surface-hover);
}

.history-item .item-info {
  flex: 1;
  min-width: 0;
}

.history-item .item-title {
  font-size: 0.82rem;
}

.history-item .item-artist {
  font-size: 0.72rem;
}

.history-item .item-actions {
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.history-item:hover .item-actions {
  opacity: 1;
}

.history-fade-enter-active,
.history-fade-leave-active {
  transition: opacity 0.2s ease, max-height 0.3s ease;
  overflow: hidden;
}

.history-fade-enter-from,
.history-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.history-fade-enter-to,
.history-fade-leave-from {
  opacity: 1;
  max-height: 600px;
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
