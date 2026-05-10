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
      <div v-if="track.thumbnail" class="art-backdrop" :style="{ backgroundImage: `url(${track.thumbnail})` }"></div>
      <div class="art-frame">
        <img v-if="track.thumbnail" :src="track.thumbnail" class="art" alt="" />
        <div v-else class="art-ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
      </div>
      <div class="art-actions">
        <FavoriteButton :song="track" />
        <button class="art-action-btn" @click="emit('toggleQueue')" title="Queue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Track Info -->
    <div class="meta">
      <div class="t-title">{{ track.title }}</div>
      <div class="t-artist">{{ track.artist }}</div>
    </div>

    <div class="context-panel" v-if="nextUpTracks.length > 0">
      <div class="context-head">
        <span>Up next</span>
        <button class="context-link" @click="emit('toggleQueue')">Open queue</button>
      </div>
      <button v-for="item in nextUpTracks" :key="item.videoId || item.id" class="next-up-item" @click="playQueueItem(item)">
        <img v-if="item.thumbnail" :src="item.thumbnail" class="next-up-thumb" alt="" />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
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
    </div>

    <div class="controls-extra">
      <div class="volume-row">
        <input type="range" min="0" max="1" step="0.01" :value="volume" @input="setVolume($event.target.value)" class="vol-slider" />
      </div>
    </div>

    <div v-if="error" class="err" @click="error = null">{{ error }}</div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { storeToRefs } from 'pinia'
import { normalizeTrack, normalizeTrackList } from '../utils/trackNormalizer.js'
import FavoriteButton from './FavoriteButton.vue'

const emit = defineEmits(['toggleQueue'])
const player = usePlayerStore()
const { currentTrack, isPlaying, currentTime, duration, volume, isLoading, repeatMode, isShuffled, hasNext, hasPrevious, progressPercent, error, queue, currentIndex } = storeToRefs(player)
const { togglePlay, playNext, playPrevious, seekTo, setVolume, toggleShuffle, cycleRepeatMode, formatTime } = player

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

function handleSeek(e) { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * 100) }
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
  margin-bottom: 12px;
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

.context-link {
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
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

/* Extra Controls */
.controls-extra {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
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
