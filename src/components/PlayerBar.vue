<template>
  <aside v-if="currentTrack" class="player-sidebar">
    <div class="sidebar-head">
      <div class="head-copy">
        <span class="now-playing-label">Now playing</span>
        <span class="queue-position">{{ queueSummary }}</span>
      </div>
      <button class="now-playing-chip" @click="emit('toggleQueue')" type="button">{{ isPlaying ? 'Playing' : 'Paused' }}</button>
    </div>

    <div class="art-container">
      <div v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" class="art-backdrop" :style="{ backgroundImage: `url(${track.thumbnail})` }"></div>
      <div class="art-frame">
        <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" class="art" alt="" />
        <div v-else class="art-ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
      </div>
      <div class="art-actions">
        <FavoriteButton :song="track" />
        <DownloadButton :song="track" />
        <PlaylistPicker :song="track" />
      </div>
    </div>

    <Visualizer class="player-viz" />

    <!-- Track Info -->
    <div class="meta">
      <div class="t-title">{{ track.title }}</div>
      <div class="t-artist">{{ track.artist }}</div>
      <div class="track-actions">
        <button class="track-action-btn" @click="shareTrack" title="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share</span>
        </button>
        <button class="track-action-btn" @click="searchArtist" title="Go to artist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Artist</span>
        </button>
      </div>
    </div>

    <div class="context-panel" v-if="nextUpTracks.length > 0">
      <div class="context-head">
        <span>Up next</span>
        <span class="context-count">{{ queueTracks.length - currentIndex - 1 }} tracks</span>
      </div>
      <button v-for="item in nextUpTracks" :key="item.videoId || item.id" class="next-up-item" @click="playQueueItem(item)">
        <img v-if="item.thumbnail && !brokenImages.has(item.thumbnail)" :src="item.thumbnail" @error="handleImageError(item.thumbnail)" class="next-up-thumb" alt="" />
        <div v-else class="next-up-thumb next-up-thumb-empty">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        <div class="next-up-copy">
          <span class="next-up-title">{{ item.title }}</span>
          <span class="next-up-artist">{{ item.artist }}</span>
        </div>
        <svg class="next-up-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>

    <!-- Progress -->
    <div class="progress-container">
      <div class="bar" @click="handleSeek">
        <div class="track"><div class="fill" :style="{ width: progressPercent+'%' }"></div></div>
      </div>
      <div class="times">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Playback Controls -->
    <div class="controls-main">
      <button class="ctrl" :class="{ on: isShuffled }" @click="toggleShuffle" title="Shuffle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
      </button>
      <button class="ctrl" @click="playPrevious" :disabled="!hasPrevious" title="Previous">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button class="play-btn" @click="togglePlay" :disabled="isLoading" title="Play/Pause">
        <div v-if="isLoading" class="spinner"></div>
        <svg v-else-if="isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="ctrl" @click="playNext" :disabled="!hasNext" title="Next">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      <button class="ctrl" :class="{ on: repeatMode !== 'off' }" @click="cycleRepeatMode" :title="'Repeat: '+repeatMode">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
      </button>
      <!-- Sleep Timer -->
      <div class="sleep-timer-wrapper">
        <button class="ctrl" :class="{ on: sleepActive }" @click="showSleepPicker = !showSleepPicker" :title="sleepActive ? 'Sleep: ' + sleepRemaining : 'Sleep Timer'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span v-if="sleepActive" class="sleep-badge">{{ sleepRemaining }}</span>
        </button>
        <transition name="fade">
          <div v-if="showSleepPicker" class="sleep-picker" @click.stop>
            <div class="sleep-picker-head">Sleep Timer</div>
            <button class="sleep-option" @click="setSleepTimer(15)">15 minutes</button>
            <button class="sleep-option" @click="setSleepTimer(30)">30 minutes</button>
            <button class="sleep-option" @click="setSleepTimer(60)">1 hour</button>
            <button class="sleep-option" @click="setSleepTimer(90)">1.5 hours</button>
            <button v-if="sleepActive" class="sleep-option cancel" @click="cancelSleepTimer">Cancel Timer</button>
          </div>
        </transition>
      </div>
      <!-- Playback Speed -->
      <div class="speed-wrapper">
        <button class="ctrl" :class="{ on: playbackSpeed !== 1 }" @click="showSpeedPicker = !showSpeedPicker" title="Playback Speed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span v-if="playbackSpeed !== 1" class="speed-badge">{{ playbackSpeed }}x</span>
        </button>
        <transition name="fade">
          <div v-if="showSpeedPicker" class="speed-picker" @click.stop>
            <div class="speed-picker-head">Playback Speed</div>
            <button
              v-for="speed in speedOptions"
              :key="speed"
              class="speed-option"
              :class="{ active: playbackSpeed === speed }"
              @click="setPlaybackSpeed(speed)"
            >{{ speed }}x</button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Queue Section -->
    <div class="queue-section">
      <div class="queue-header">
        <div class="queue-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span>Queue</span>
        </div>
        <span class="queue-count">{{ queueTracks.length }} tracks</span>
      </div>
      
      <div class="queue-list" v-if="queueTracks.length > 0">
        <button
          v-for="(item, index) in queueTracks"
          :key="item.videoId || item.id"
          class="queue-item"
          :class="{ active: index === currentIndex }"
          @click="playQueueItem(item)"
        >
          <span class="queue-index">{{ index + 1 }}</span>
          <img v-if="item.thumbnail && !brokenImages.has(item.thumbnail)" :src="item.thumbnail" @error="handleImageError(item.thumbnail)" class="queue-thumb" alt="" />
          <div v-else class="queue-thumb queue-thumb-empty">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div class="queue-info">
            <span class="queue-track-title">{{ item.title }}</span>
            <span class="queue-track-artist">{{ item.artist }}</span>
          </div>
          <svg v-if="index === currentIndex" class="queue-playing-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      
      <div v-else class="queue-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
        </svg>
        <p>No tracks in queue</p>
      </div>
    </div>

    <div v-if="error" class="err" @click="error = null">{{ error }}</div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { storeToRefs } from 'pinia'
import { normalizeTrack, normalizeTrackList } from '../utils/trackNormalizer.js'
import FavoriteButton from './FavoriteButton.vue'
import DownloadButton from './DownloadButton.vue'
import PlaylistPicker from './PlaylistPicker.vue'
import { useSleepTimer } from '../composables/useSleepTimer.js'
import { useNotifications } from '../composables/useNotifications.js'
import Visualizer from './Visualizer.vue'

const emit = defineEmits(['toggleQueue'])
const router = useRouter()
const player = usePlayerStore()
const { currentTrack, isPlaying, currentTime, duration, volume, isLoading, repeatMode, isShuffled, hasNext, hasPrevious, progressPercent, error, queue, currentIndex } = storeToRefs(player)
const { togglePlay, playNext, playPrevious, seekTo, setVolume, toggleShuffle, cycleRepeatMode, formatTime } = player

const brokenImages = ref(new Set())
function handleImageError(url) {
  if (url) brokenImages.value.add(url)
}

const { isActive: sleepActive, remainingTime: sleepRemaining, setTimer, cancelTimer } = useSleepTimer(player)
const { showNotification } = useNotifications()
const showSleepPicker = ref(false)

const playbackSpeed = ref(1)
const showSpeedPicker = ref(false)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

function setPlaybackSpeed(speed) {
  playbackSpeed.value = speed
  player.applyPlaybackSpeed(speed)
  // Persist to settings
  try {
    const saved = JSON.parse(localStorage.getItem('musicReonSettings') || '{}')
    saved.playbackSpeed = speed
    localStorage.setItem('musicReonSettings', JSON.stringify(saved))
  } catch (e) {}
  showSpeedPicker.value = false
}

function setSleepTimer(minutes) {
  setTimer(minutes)
  showSleepPicker.value = false
}

function cancelSleepTimer() {
  cancelTimer()
  showSleepPicker.value = false
}

const track = computed(() => normalizeTrack(currentTrack.value || {}))
const queueTracks = computed(() => normalizeTrackList(queue.value))
const queueSummary = computed(() => {
  if (!queueTracks.value.length) return 'Solo session'
  const current = currentIndex.value >= 0 ? currentIndex.value + 1 : 1
  return `${current}/${queueTracks.value.length}`
})

const nextUpTracks = computed(() => {
  if (!queueTracks.value.length) return []
  const startIndex = currentIndex.value >= 0 ? currentIndex.value + 1 : 0
  return queueTracks.value.slice(startIndex, startIndex + 3)
})

function playQueueItem(item) {
  const selectedIndex = queueTracks.value.findIndex(trackItem => trackItem.videoId === item.videoId)
  if (selectedIndex < 0) return

  player.setQueue(queueTracks.value, selectedIndex)
  player.playTrack(queueTracks.value[selectedIndex])
}

function handleSeek(e) { 
  const r = e.currentTarget.getBoundingClientRect()
  seekTo(((e.clientX - r.left) / r.width) * 100) 
}

function shareTrack() {
  const url = `https://www.youtube.com/watch?v=${track.value.videoId}`
  const text = `${track.value.title} - ${track.value.artist}`
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text}\n${url}`)
      .then(() => showNotification({ title: 'Link copied!', type: 'success' }))
      .catch(() => showNotification({ title: 'Share', message: `${text}\n${url}`, type: 'info' }))
  } else {
    showNotification({ title: 'Share', message: `${text}\n${url}`, type: 'info' })
  }
}

function searchArtist() {
  if (track.value.artist) {
    router.push({ name: 'search', query: { q: track.value.artist } })
  }
}
</script>

<style scoped>
.player-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--player-sidebar-width);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-left: var(--glass-border);
  display: flex;
  flex-direction: column;
  padding: 15px 15px 17px;
  z-index: 100;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.head-copy {
  min-width: 0;
}

.now-playing-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.queue-position {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text);
  font-weight: 500;
}

.now-playing-chip {
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.3);
  padding: 5px 10px;
  border-radius: 100px;
  cursor: pointer;
}

/* Big Art */
.art-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 22px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.34);
  position: relative;
}

.art-backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(28px) saturate(1.1);
  transform: scale(1.2);
  opacity: 0.24;
}
.art-frame {
  position: absolute;
  inset: 10px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.art {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}
.art:hover { transform: scale(1.01); }
.art-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}
.art-ph svg { width: 48px; height: 48px; }

.art-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.player-viz {
  margin: -8px 20px 0;
}

.art-action-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.art-action-btn:hover {
  transform: translateY(-1px) scale(1.04);
  color: var(--color-text);
  background: white;
}

.art-action-btn svg {
  width: 16px;
  height: 16px;
}

/* Meta */
.meta {
  text-align: left;
  margin-bottom: 16px;
}
.t-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.t-artist {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
}

.track-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.track-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.4);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.track-action-btn svg {
  width: 14px;
  height: 14px;
}

.track-action-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-1px);
}

.context-panel {
  margin-bottom: 12px;
  padding: 10px 10px 6px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.context-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.context-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
}

.next-up-item {
  width: 100%;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 18px;
  gap: 10px;
  align-items: center;
  border: none;
  background: transparent;
  padding: 8px 0;
  cursor: pointer;
  text-align: left;
}

.next-up-item + .next-up-item {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.next-up-thumb {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.next-up-thumb-empty {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(245, 158, 11, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.next-up-thumb-empty svg {
  width: 18px;
  height: 18px;
}

.next-up-copy {
  min-width: 0;
}

.next-up-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.next-up-artist {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.next-up-play {
  width: 14px;
  height: 14px;
  color: var(--color-primary);
  opacity: 0.8;
}

/* Progress */
.progress-container {
  width: 100%;
  margin-bottom: 16px;
}
.bar {
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
}
.track {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 100px;
  overflow: hidden;
  transition: height 0.15s ease;
}
.bar:hover .track { height: 4px; }
.fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 100px;
  transition: width 0.1s linear;
}
.times {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

/* Main Controls */
.controls-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 6px;
}
.ctrl {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.15s ease;
}
.ctrl svg { width: 18px; height: 18px; }
.ctrl:hover:not(:disabled) { color: var(--color-text); background: var(--color-surface-hover); }
.ctrl:disabled { opacity: 0.25; cursor: not-allowed; }
.ctrl.on { color: var(--color-primary); }

/* Sleep Timer */
.sleep-timer-wrapper {
  position: relative;
}

.sleep-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 8px;
  font-weight: 700;
  background: var(--color-primary);
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-family: var(--font-mono);
  line-height: 1;
}

.sleep-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 100;
  min-width: 170px;
  overflow: hidden;
  animation: scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.sleep-picker-head {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.sleep-option {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.sleep-option:hover {
  background: var(--color-surface-hover);
}

.sleep-option.cancel {
  color: var(--color-error);
  border-top: 1px solid var(--color-border);
}

@keyframes scaleIn {
  from { opacity: 0; transform: translateX(-50%) scale(0.95); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-leave-to {
  opacity: 0;
}

.speed-wrapper {
  position: relative;
}

.speed-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 7px;
  font-weight: 800;
  background: var(--color-primary);
  color: white;
  padding: 1px 3px;
  border-radius: 6px;
  font-family: var(--font-mono);
  line-height: 1;
}

.speed-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 100;
  min-width: 120px;
  overflow: hidden;
  animation: scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.speed-picker-head {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.speed-option {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.speed-option:hover {
  background: var(--color-surface-hover);
}

.speed-option.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.play-btn {
  background: var(--color-primary);
  border: none;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
}
.play-btn svg { width: 24px; height: 24px; }
.play-btn:hover:not(:disabled) { transform: scale(1.08); background: var(--color-primary-dark); }
.play-btn:active:not(:disabled) { transform: scale(0.95); }
.play-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Queue Section */
.queue-section {
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

.queue-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
}

.queue-title svg {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}

.queue-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 4px;
}

.queue-list::-webkit-scrollbar {
  width: 6px;
}

.queue-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 3px;
}

.queue-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 3px;
}

.queue-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.18);
}

.queue-item {
  width: 100%;
  display: grid;
  grid-template-columns: 24px 48px minmax(0, 1fr) 20px;
  gap: 10px;
  align-items: center;
  border: none;
  background: transparent;
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.queue-item.active {
  background: rgba(249, 115, 22, 0.12);
}

.queue-item.active:hover {
  background: rgba(249, 115, 22, 0.18);
}

.queue-index {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.queue-item.active .queue-index {
  color: var(--color-primary);
}

.queue-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.queue-thumb-empty {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(245, 158, 11, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.queue-thumb-empty svg {
  width: 20px;
  height: 20px;
}

.queue-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-track-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-item.active .queue-track-title {
  color: var(--color-primary);
}

.queue-track-artist {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-playing-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}

.queue-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}

.queue-empty svg {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  opacity: 0.3;
}

.queue-empty p {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* Extra Controls */
.controls-extra {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.vol-icon {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.vol-icon svg {
  width: 18px;
  height: 18px;
}

.vol-icon:hover {
  color: var(--color-text);
}

.vol-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 100px;
  outline: none;
}
.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
}
.vol-slider::-webkit-slider-thumb:hover { transform: scale(1.3); }

.vol-percent {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.extra-actions {
  display: flex;
  gap: 8px;
}

.extra-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.4);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.extra-btn svg {
  width: 16px;
  height: 16px;
}

.extra-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .player-sidebar {
    width: min(100vw, 420px);
    padding: 14px 14px 16px;
  }

  .controls-main {
    padding: 0 2px;
  }

  .art-container {
    border-radius: 18px;
  }

  .art-frame {
    inset: 8px;
  }

  .context-panel {
    padding: 9px 9px 5px;
  }

  .play-btn {
    width: 58px;
    height: 58px;
  }

  .play-btn svg {
    width: 24px;
    height: 24px;
  }
  
  .track-actions {
    flex-direction: column;
  }
  
  .extra-actions {
    flex-direction: column;
  }
}
.vol-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.vol-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 100px;
  outline: none;
}
.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
}
.vol-slider::-webkit-slider-thumb:hover { transform: scale(1.3); }

/* Error toast */
.err {
  margin-top: 16px;
  background: var(--color-error);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239,68,68,0.25);
}

:deep(.favorite-btn) {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-text-muted);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

:deep(.favorite-btn svg) {
  width: 18px;
  height: 18px;
}

:deep(.favorite-btn.active) {
  color: var(--color-primary);
}

:deep(.favorite-btn:hover) {
  background: white;
}

:deep(.favorite-btn.active:hover) {
  color: var(--color-primary);
}
</style>
