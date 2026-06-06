<template>
  <div class="track-card" @click="onClick" @contextmenu.prevent="openCtx" :class="{ playing: isCurrentTrack, selected: selected, 'no-index': index === undefined }">
    <!-- Index Column -->
    <div v-if="index !== undefined" class="index-col">
      <span v-if="isCurrentTrack && isPlaying" class="playing-indicator">
        <span class="bar bar1"></span>
        <span class="bar bar2"></span>
        <span class="bar bar3"></span>
      </span>
      <span v-else-if="isCurrentTrack" class="playing-indicator-paused">
        <svg viewBox="0 0 24 24" fill="currentColor" class="eq-paused-svg">
          <rect x="3" y="12" width="3" height="8" rx="0.5" />
          <rect x="8" y="4" width="3" height="16" rx="0.5" />
          <rect x="13" y="9" width="3" height="11" rx="0.5" />
        </svg>
      </span>
      <span v-else class="index-num">{{ index }}</span>
      <span class="hover-play-icon">
        <svg v-if="isCurrentTrack && isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
    </div>

    <!-- Album Art / Thumbnail Column -->
    <div class="thumb-wrap">
      <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" :alt="track.title" @error="handleImageError(track.thumbnail)" class="thumb" loading="lazy" decoding="async" />
      <div v-else class="thumb-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div v-if="index === undefined" class="play-overlay">
        <svg v-if="isCurrentTrack && isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>

    <!-- Title Column -->
    <div class="title-col">
      <span class="title-text" :title="track.title">{{ displayTitle }}</span>
      <span class="artist-subtext">{{ track.artist || track.channel || 'Unknown Artist' }}</span>
    </div>

    <!-- Artist/Channel Column -->
    <div class="artist-col">
      <span class="artist-text" :title="track.artist || track.channel">{{ track.artist || track.channel || 'Unknown Artist' }}</span>
    </div>

    <!-- Actions Column -->
    <div class="actions-col">
      <button class="action-btn queue-btn" @click.stop="addToQueue" title="Add to Queue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <button class="action-btn radio-btn" @click.stop="startRadio" title="Start Radio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 13.2c-2.3-2.3-2.3-6.1 0-8.5"/><path d="M19.1 1.9c3.9 3.9 3.9 10.3 0 14.2"/><path d="M16.2 10.8c0 2.3-1.9 4.2-4.2 4.2"/><circle cx="12" cy="10.8" r="1"/>
        </svg>
      </button>
      <PlaylistPicker :song="track" />
      <DownloadButton :song="track" />
      <FavoriteButton :song="track" />
    </div>

    <!-- Always-visible More Menu -->
    <button class="action-btn more-btn" @click.stop="openMoreMenu" title="More">
      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
    </button>

    <!-- Duration Column -->
    <div v-if="track.duration" class="dur-col">{{ formatDuration(track.duration) }}</div>

    <ContextMenu :visible="ctxVisible" :x="ctxX" :y="ctxY" :items="ctxItems" @close="ctxVisible = false" />
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
import ContextMenu from './ContextMenu.vue'

const props = defineProps({
  track: { type: Object, required: true },
  index: { type: Number, required: false, default: undefined },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['play', 'select'])
const player = usePlayerStore()
const { showNotification } = useNotifications()

const isCurrentTrack = computed(() => player.currentTrack?.videoId === props.track.videoId)
const isPlaying = computed(() => player.isPlaying)

const displayTitle = computed(() => {
  const t = props.track.title || ''
  const idx = t.indexOf('|')
  return idx > 0 ? t.slice(0, idx).trim() : t
})

function handlePlay() {
  emit('play', props.track)
}

function onClick(e) {
  if (e.ctrlKey || e.metaKey || e.shiftKey) {
    e.preventDefault()
    emit('select', props.track)
  } else {
    handlePlay()
  }
}

const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)

const ctxItems = computed(() => [
  { label: 'Play Next', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>', action: () => { if (player.currentTrack) { const idx = player.currentIndex + 1; player.queue.splice(idx, 0, props.track) } else { player.addToQueue(props.track) } } },
  { label: 'Add to Queue', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>', action: () => { player.addToQueue(props.track); showNotification({ title: 'Added to Queue', message: props.track.title, type: 'success' }) } },
  { label: 'Start Radio', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 13.2c-2.3-2.3-2.3-6.1 0-8.5"/><path d="M19.1 1.9c3.9 3.9 3.9 10.3 0 14.2"/><circle cx="12" cy="10.8" r="1"/></svg>', action: () => startRadio() },
])

function openCtx(e) {
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxVisible.value = true
}

function openMoreMenu(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  ctxX.value = rect.left
  ctxY.value = rect.bottom + 4
  ctxVisible.value = true
}

function formatDuration(s) {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function addToQueue() {
  player.addToQueue(props.track)
  showNotification({ title: 'Added to Queue', message: props.track.title, type: 'success' })
}

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
  display: grid;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  grid-template-columns: 32px 56px 2fr 1.2fr 140px 60px 32px;
}

.track-card.no-index {
  grid-template-columns: 56px 2fr 1.2fr 140px 60px 32px;
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
  border-color: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.track-card:hover::before {
  opacity: 1;
}

.track-card.playing {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(249, 115, 22, 0.01));
  border-color: rgba(249, 115, 22, 0.15);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.05);
}

.track-card.playing::before {
  opacity: 1;
}

.track-card.selected {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.03));
  border-color: rgba(99, 102, 241, 0.2);
}

/* Index Column styles */
.index-col {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.index-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: opacity 0.15s ease;
}

.hover-play-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  color: var(--color-primary);
  transition: opacity 0.15s ease;
}

.hover-play-icon svg {
  width: 16px;
  height: 16px;
}

.track-card:hover .index-num,
.track-card:hover .playing-indicator,
.track-card:hover .playing-indicator-paused {
  opacity: 0;
}

.track-card:hover .hover-play-icon {
  opacity: 1;
}

/* Playing Equalizer Indicator */
.playing-indicator {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 16px;
  height: 16px;
}

.playing-indicator .bar {
  width: 3px;
  background: var(--color-primary);
  border-radius: 1px;
  animation: bounce 0.8s ease-in-out infinite alternate;
}

.playing-indicator .bar1 { height: 30%; animation-delay: 0.1s; }
.playing-indicator .bar2 { height: 100%; animation-delay: 0.3s; }
.playing-indicator .bar3 { height: 60%; animation-delay: 0.2s; }

.playing-indicator-paused {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.eq-paused-svg {
  width: 16px;
  height: 16px;
}

@keyframes bounce {
  0% { transform: scaleY(0.2); }
  100% { transform: scaleY(1.0); }
}

/* Thumbnail wrapper styles */
.thumb-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.track-card:hover .thumb {
  transform: scale(1.05);
}

.thumb-empty {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-surface-hover), var(--color-surface));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.thumb-empty svg {
  width: 22px;
  height: 22px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
  backdrop-filter: blur(2px);
}

.play-overlay svg {
  width: 22px;
  height: 22px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.track-card:hover .play-overlay {
  opacity: 1;
}

/* Title Column styles */
.title-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.track-card.playing .title-text {
  color: var(--color-primary);
}

.artist-subtext {
  display: none;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Artist Column styles */
.artist-col {
  min-width: 0;
  text-align: left;
}

.artist-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions Column styles */
.actions-col {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  justify-content: center;
}

.track-card:hover .actions-col,
.track-card.playing .actions-col {
  opacity: 1;
}

/* Duration Column styles */
.dur-col {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  text-align: right;
}

/* Responsive breakpoint styling */
@media (max-width: 900px) {
  .track-card {
    grid-template-columns: 32px 56px 1fr 140px 60px 32px;
  }

  .track-card.no-index {
    grid-template-columns: 56px 1fr 140px 60px 32px;
  }

  .artist-col {
    display: none;
  }

  .artist-subtext {
    display: block;
  }
}

@media (max-width: 600px) {
  .track-card {
    grid-template-columns: 48px 1fr 40px 28px;
    gap: 12px;
    padding: 8px 12px;
  }

  .track-card.no-index {
    grid-template-columns: 48px 1fr 40px 28px;
  }

  .index-col {
    display: none;
  }

  .thumb-wrap {
    width: 48px;
    height: 48px;
  }

  .actions-col {
    display: none; /* Hide action icons on extremely small screen lists */
  }
}

@media (max-width: 380px) {
  .track-card { padding: 6px 8px; gap: 8px; }
  .title-text { font-size: 13px; }
  .dur-col { font-size: 11px; }
}

@media (min-width: 1700px) {
  .track-card { grid-template-columns: 36px 60px 2.2fr 1.2fr 160px 70px 36px; gap: 20px; }
  .track-card.no-index { grid-template-columns: 60px 2.2fr 1.2fr 160px 70px 36px; }
  .title-text { font-size: 15px; }
  .artist-text { font-size: 14px; }
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

.more-btn {
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
  opacity: 1;
}

.more-btn svg {
  width: 4px;
  height: 16px;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}
</style>
