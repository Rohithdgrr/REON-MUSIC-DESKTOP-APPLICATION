<template>
  <div class="track-card" @click="handlePlay" :class="{ playing: isCurrentTrack }">
    <div class="thumb-wrap">
      <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" :alt="track.title" @error="handleImageError(track.thumbnail)" class="thumb" />
      <div v-else class="thumb-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="play-overlay">
        <svg v-if="isCurrentTrack && isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
    <div class="info">
      <div class="title" :title="track.title">{{ track.title }}</div>
      <div class="artist">{{ track.artist }}</div>
    </div>
    <div class="actions">
      <button class="action-btn radio-btn" @click.stop="startRadio" title="Start Radio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 13.2c-2.3-2.3-2.3-6.1 0-8.5"/><path d="M19.1 1.9c3.9 3.9 3.9 10.3 0 14.2"/><path d="M16.2 10.8c0 2.3-1.9 4.2-4.2 4.2"/><circle cx="12" cy="10.8" r="1"/>
        </svg>
      </button>
      <PlaylistPicker :song="track" />
      <DownloadButton :song="track" />
      <FavoriteButton :song="track" />
    </div>
    <div v-if="track.duration" class="dur">{{ formatDuration(track.duration) }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useNotifications } from '../composables/useNotifications.js'
import { radioService } from '../services/RadioService.js'
import FavoriteButton from './FavoriteButton.vue'
import DownloadButton from './DownloadButton.vue'
import PlaylistPicker from './PlaylistPicker.vue'

const props = defineProps({ track: { type: Object, required: true } })
const emit = defineEmits(['play'])
const player = usePlayerStore()
const { showNotification } = useNotifications()
const isCurrentTrack = computed(() => player.currentTrack?.videoId === props.track.videoId)
const isPlaying = computed(() => player.isPlaying)
function handlePlay() { emit('play', props.track) }
function formatDuration(s) { if (!s) return ''; const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}` }

async function startRadio() {
  try {
    showNotification({ title: 'Generating radio...', message: `Finding songs like "${props.track.title}"`, type: 'info' })
    const tracks = await radioService.generateRadio(props.track, 20)
    if (tracks.length === 0) {
      showNotification({ title: 'No results', message: 'Could not find similar songs', type: 'error' })
      return
    }
    player.setQueue(tracks, 0)
    player.playTrack(tracks[0])
    showNotification({ title: 'Radio Started', message: `${tracks.length} similar songs queued`, type: 'success' })
  } catch (err) {
    showNotification({ title: 'Radio failed', message: err.message, type: 'error' })
  }
}

const brokenImages = ref(new Set())
function handleImageError(url) {
  if (url) brokenImages.value.add(url)
}
</script>

<style scoped>
.track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.track-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.03), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.track-card:hover {
  background: var(--color-surface-hover);
  border-color: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.track-card:hover::before {
  opacity: 1;
}

.track-card.playing {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02));
  border-color: rgba(249, 115, 22, 0.2);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
}

.track-card.playing::before {
  opacity: 1;
}

.thumb-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.track-card:hover .thumb {
  transform: scale(1.05);
}

.thumb-empty {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-surface-hover), var(--color-surface));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.thumb-empty svg {
  width: 28px;
  height: 28px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
  backdrop-filter: blur(3px);
}

.play-overlay svg {
  width: 28px;
  height: 28px;
  color: white;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

.track-card:hover .play-overlay,
.track-card.playing .play-overlay {
  opacity: 1;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 14px;
  font-weight: var(--font-semibold);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  letter-spacing: -0.01em;
  transition: color 0.2s ease;
}

.track-card.playing .title {
  color: var(--color-primary);
}

.artist {
  font-size: 12px;
  font-weight: var(--font-normal);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-top: 2px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-card:hover .actions,
.track-card.playing .actions {
  opacity: 1;
}

.dur {
  font-size: 12px;
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  min-width: 40px;
  text-align: right;
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .track-card {
    padding: 8px 12px;
    gap: 12px;
  }
  
  .thumb-wrap {
    width: 56px;
    height: 56px;
  }
  
  .title {
    font-size: 13px;
  }
  
  .actions {
    opacity: 1;
  }
}

.radio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.radio-btn svg {
  width: 15px;
  height: 15px;
}

.radio-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}
</style>
