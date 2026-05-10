<template>
  <div class="track-card" @click="handlePlay" :class="{ playing: isCurrentTrack }">
    <div class="thumb-wrap">
      <img v-if="track.thumbnail" :src="track.thumbnail" :alt="track.title" class="thumb" />
      <div v-else class="thumb-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="play-hover">
        <svg v-if="isCurrentTrack && isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
    <div class="info">
      <div class="title" :title="track.title">{{ track.title }}</div>
      <div class="artist">{{ track.artist }}</div>
    </div>
    <FavoriteButton :song="track" />
    <div v-if="track.duration" class="dur">{{ formatDuration(track.duration) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import FavoriteButton from './FavoriteButton.vue'

const props = defineProps({ track: { type: Object, required: true } })
const emit = defineEmits(['play'])
const player = usePlayerStore()
const isCurrentTrack = computed(() => player.currentTrack?.videoId === props.track.videoId)
const isPlaying = computed(() => player.isPlaying)
function handlePlay() { emit('play', props.track) }
function formatDuration(s) { if (!s) return ''; const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}` }
</script>

<style scoped>
.track-card {
  display: flex; align-items: center; gap: 14px; padding: 8px 12px;
  border-radius: 10px; cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent;
}
.track-card:hover { background: var(--color-surface-hover); }
.track-card.playing { background: rgba(249,115,22,0.06); border-color: rgba(249,115,22,0.1); }

.thumb-wrap { position: relative; width: 52px; height: 52px; flex-shrink: 0; }
.thumb { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.thumb-empty {
  width: 100%; height: 100%; background: var(--color-surface-hover); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; color: var(--color-text-muted);
}
.thumb-empty svg { width: 22px; height: 22px; }

.play-hover {
  position: absolute; inset: 0; background: rgba(0,0,0,0.45); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.15s ease;
}
.play-hover svg { width: 20px; height: 20px; color: white; }
.track-card:hover .play-hover, .track-card.playing .play-hover { opacity: 1; }

.info { flex: 1; min-width: 0; }
.title {
  font-size: 13px; font-weight: 600; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.track-card.playing .title { color: var(--color-primary); }
.artist { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.dur { font-size: 12px; color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
</style>
