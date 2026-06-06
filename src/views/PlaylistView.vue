<template>
  <div class="playlist-view">
    <Transition name="panel-slide">
      <div v-if="showInfo" class="info-panel">
        <div class="info-panel-body">
          <div class="info-panel-head">
            <h2>Playlist Info</h2>
            <button class="info-close" @click="showInfo = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="info-field">
            <label>Name</label>
            <input v-model="editName" class="info-input" placeholder="Playlist name" @keyup.enter="saveInfo" />
          </div>

          <div class="info-field">
            <label>Description</label>
            <textarea v-model="editDescription" class="info-textarea" placeholder="Add a description..." rows="3" />
          </div>

          <button class="save-info-btn" @click="saveInfo" :disabled="!hasInfoChanges">Save Changes</button>

          <div class="info-stats">
            <div class="info-stat-row">
              <span class="info-stat-label">Songs</span>
              <span class="info-stat-value">{{ songs.length }}</span>
            </div>
            <div class="info-stat-row">
              <span class="info-stat-label">Total Duration</span>
              <span class="info-stat-value">{{ totalDuration }}</span>
            </div>
            <div class="info-stat-row">
              <span class="info-stat-label">Avg. Song Length</span>
              <span class="info-stat-value">{{ avgDuration }}</span>
            </div>
            <div class="info-stat-row">
              <span class="info-stat-label">Top Artist</span>
              <span class="info-stat-value">{{ topArtist }}</span>
            </div>
            <div class="info-stat-row">
              <span class="info-stat-label">Created</span>
              <span class="info-stat-value">{{ createdDate }}</span>
            </div>
          </div>

          <div v-if="topArtistsList.length > 0" class="info-artists">
            <h3>Artists</h3>
            <div v-for="a in topArtistsList" :key="a.name" class="info-artist-row">
              <span class="info-artist-name">{{ a.name }}</span>
              <span class="info-artist-count">{{ a.count }} songs</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="back-row">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
    </div>

    <div v-if="playlist" class="playlist-header">
      <div class="playlist-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
      </div>
      <div class="playlist-meta">
        <span class="playlist-label">Playlist</span>
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <div class="playlist-meta-row">
          <span class="song-count">{{ songs.length }} songs</span>
          <span v-if="totalDuration" class="duration-sep">·</span>
          <span v-if="totalDuration" class="total-duration">{{ totalDuration }}</span>
        </div>
      </div>
      <div class="playlist-actions">
        <button class="action-btn info" @click="showInfo = !showInfo" :class="{ active: showInfo }" title="Playlist Info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Info
        </button>
        <button v-if="songs.length > 0" class="action-btn play-all" @click="playAll">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Play All
        </button>
        <button class="action-btn delete" @click="handleDeletePlaylist">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          Delete
        </button>
      </div>
    </div>

    <div class="playlist-toolbar" v-if="songs.length > 0">
      <div class="playlist-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="filterQuery" type="text" placeholder="Search in playlist..." class="filter-input" />
        <button v-if="filterQuery" class="filter-clear" @click="filterQuery = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <span class="filter-count" v-if="filterQuery">{{ filteredSongs.length }} of {{ songs.length }}</span>
      <button class="scroll-to-current" @click="scrollToCurrent" title="Scroll to current track">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
    </div>

    <div v-if="songs.length > 0" class="track-list">
      <draggable v-model="songs" item-key="id" handle=".drag-handle" ghost-class="ghost" :animation="200" @change="onReorder" class="draggable-list">
        <template #item="{ element: song }">
          <div :key="song.id" class="track-row" v-show="matchesFilter(song)">
            <button class="drag-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            </button>
            <TrackCard
              :track="{
                videoId: song.video_id,
                title: song.title,
                artist: song.artist,
                thumbnail: song.thumbnail_url,
                duration: song.duration_seconds
              }"
              @play="handlePlay"
            />
            <button class="remove-song-btn" @click="handleRemoveSong(song)" title="Remove from playlist">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </template>
      </draggable>
    </div>
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <h2>This playlist is empty</h2>
      <p>Search for songs and add them to this playlist</p>
      <button @click="goToSearch" class="browse-btn">Browse Music</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { useNotifications } from '../composables/useNotifications.js'
import TrackCard from '../components/TrackCard.vue'
import { normalizeTrack } from '../utils/trackNormalizer.js'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()
const library = useLibraryStore()
const { showNotification } = useNotifications()

const playlist = ref(null)
const songs = ref([])
const showInfo = ref(false)
const editName = ref('')
const editDescription = ref('')
const filterQuery = ref('')

const filteredSongs = computed(() => {
  if (!filterQuery.value) return songs.value
  const q = filterQuery.value.toLowerCase()
  return songs.value.filter(s => (s.title || '').toLowerCase().includes(q) || (s.artist || '').toLowerCase().includes(q))
})

function matchesFilter(song) {
  if (!filterQuery.value) return true
  const q = filterQuery.value.toLowerCase()
  return (song.title || '').toLowerCase().includes(q) || (song.artist || '').toLowerCase().includes(q)
}

const hasInfoChanges = computed(() => {
  if (!playlist.value) return false
  return editName.value !== playlist.value.name || editDescription.value !== (playlist.value.description || '')
})

const totalDuration = computed(() => {
  const total = songs.value.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
  if (!total) return ''
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
})

const avgDuration = computed(() => {
  if (!songs.value.length) return '—'
  const avg = songs.value.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / songs.value.length
  const m = Math.floor(avg / 60)
  const sec = Math.floor(avg % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
})

const topArtist = computed(() => {
  if (!songs.value.length) return '—'
  const counts = {}
  songs.value.forEach(s => { counts[s.artist] = (counts[s.artist] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
})

const topArtistsList = computed(() => {
  const counts = {}
  songs.value.forEach(s => { counts[s.artist] = (counts[s.artist] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))
})

const createdDate = computed(() => {
  if (!playlist.value?.created_at) return '—'
  return new Date(playlist.value.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

async function loadPlaylist() {
  const playlistId = parseInt(route.params.id)
  const pl = library.playlists.find(p => p.id === playlistId)
  if (pl) {
    playlist.value = pl
    editName.value = pl.name
    editDescription.value = pl.description || ''
  }
  const data = await library.getPlaylistSongs(playlistId)
  songs.value = data
}

onMounted(loadPlaylist)
watch(() => route.params.id, () => {
  showInfo.value = false
  loadPlaylist()
})

async function saveInfo() {
  if (!playlist.value || !hasInfoChanges.value) return
  const result = await library.updatePlaylist(playlist.value.id, {
    name: editName.value.trim(),
    description: editDescription.value.trim()
  })
  if (result.success) {
    showNotification({ title: 'Playlist updated', type: 'success' })
  } else {
    showNotification({ title: 'Failed to update', message: result.error, type: 'error' })
  }
}

function handlePlay(track) {
  const queue = songs.value.map(s => ({
    videoId: s.video_id,
    title: s.title,
    artist: s.artist,
    thumbnail: s.thumbnail_url,
    duration: s.duration_seconds
  }))
  const index = queue.findIndex(t => t.videoId === track.videoId)
  player.setQueue(queue, index >= 0 ? index : 0)
  player.playTrack(track)
}

function playAll() {
  if (songs.value.length > 0) {
    const queue = songs.value.map(s => ({
      videoId: s.video_id,
      title: s.title,
      artist: s.artist,
      thumbnail: s.thumbnail_url,
      duration: s.duration_seconds
    }))
    player.setQueue(queue, 0)
    player.playTrack(queue[0])
  }
}

async function handleRemoveSong(song) {
  if (confirm(`Remove "${song.title}" from this playlist?`)) {
    const ok = await library.removeSongFromPlaylist(playlist.value.id, song.id)
    if (ok) {
      songs.value = songs.value.filter(s => s.id !== song.id)
    }
  }
}

async function onReorder() {
  const pid = playlist.value.id
  for (let i = 0; i < songs.value.length; i++) {
    await library.reorderPlaylistTrack(pid, songs.value[i].id, i)
  }
}

function goBack() {
  router.back()
}

async function handleDeletePlaylist() {
  if (confirm(`Delete "${playlist.value.name}" permanently?`)) {
    const ok = await library.deletePlaylist(playlist.value.id)
    if (ok) {
      router.push('/library')
    }
  }
}

function goToSearch() {
  router.push('/search')
}

function scrollToCurrent() {
  const el = document.querySelector('.track-card.playing')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<style scoped>
.playlist-view {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.playlist-header {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.playlist-icon {
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: var(--shadow-lg);
}

.playlist-icon svg {
  width: 56px;
  height: 56px;
}

.playlist-meta {
  flex: 1;
}

.playlist-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.playlist-name {
  font-size: 40px;
  font-weight: 700;
  margin: 8px 0;
  color: var(--color-text);
}

.playlist-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.duration-sep {
  color: var(--color-border);
}

.playlist-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.play-all {
  background: var(--color-primary);
  color: white;
}
.play-all:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.info {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.info:hover {
  background: rgba(99, 102, 241, 0.2);
}
.info.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.delete {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}
.delete:hover {
  background: rgba(244, 67, 54, 0.2);
}

/* Info Panel */
.info-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: var(--color-surface-elevated);
  border-left: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  z-index: 500;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.info-panel-body {
  padding: 24px;
}

.info-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.info-panel-head h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.info-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.info-close:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.info-close svg {
  width: 18px;
  height: 18px;
}

.info-field {
  margin-bottom: 16px;
}

.info-field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.info-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.info-input:focus {
  border-color: var(--color-primary);
}

.info-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.info-textarea:focus {
  border-color: var(--color-primary);
}

.save-info-btn {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 24px;
}

.save-info-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.save-info-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.info-stats {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 20px;
}

.info-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-stat-row:last-child {
  border-bottom: none;
}

.info-stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.info-stat-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  text-align: right;
}

.info-artists h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.info-artist-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.info-artist-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.info-artist-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Panel Transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid var(--color-border);
}

.playlist-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.playlist-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  flex: 1;
  transition: border-color var(--transition-fast);
}

.playlist-search:focus-within {
  border-color: var(--color-primary);
}

.playlist-search svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.filter-input {
  border: none;
  background: none;
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  width: 100%;
}

.filter-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
}

.filter-clear svg {
  width: 14px;
  height: 14px;
}

.filter-clear:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.filter-count {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.scroll-to-current {
  background: none; border: none; cursor: pointer;
  color: var(--color-text-muted); display: flex; align-items: center;
  padding: 4px 6px; border-radius: 6px; transition: all var(--transition-fast);
  flex-shrink: 0;
}
.scroll-to-current svg { width: 16px; height: 16px; }
.scroll-to-current:hover { background: var(--color-surface-hover); color: var(--color-primary); }

.track-list .track-card {
  margin: 0;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity var(--transition-fast);
}

.drag-handle {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.track-row:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle svg {
  width: 14px;
  height: 14px;
}

.ghost {
  opacity: 0.3;
  background: var(--color-surface-hover);
  border-radius: var(--radius-md);
}

.draggable-list {
  display: contents;
}

.track-row > :first-child {
  flex: 1;
}

.remove-song-btn {
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
  opacity: 0;
  transition: all var(--transition-fast);
}

.track-row:hover .remove-song-btn {
  opacity: 1;
}

.remove-song-btn svg {
  width: 16px;
  height: 16px;
}

.remove-song-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 1rem;
  margin-bottom: 20px;
}

.browse-btn {
  padding: 10px 28px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.browse-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

/* === Responsive === */
@media (max-width: 900px) {
  .playlist-icon { width: 130px; height: 130px; }
  .playlist-icon svg { width: 44px; height: 44px; }
  .playlist-name { font-size: 32px; }
  .list-headers { grid-template-columns: 32px 56px 1fr 140px 60px; padding: 8px 16px; }
  .header-artist { display: none; }
}

@media (max-width: 768px) {
  .playlist-icon { width: 110px; height: 110px; }
  .playlist-icon svg { width: 40px; height: 40px; }
  .playlist-name { font-size: 28px; }
  .playlist-toolbar { flex-wrap: wrap; gap: 8px; }
  .playlist-search { flex: 1; min-width: 0; }
}

@media (max-width: 480px) {
  .playlist-view { padding: 0 4px; }
  .playlist-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .playlist-icon { width: 96px; height: 96px; }
  .playlist-icon svg { width: 36px; height: 36px; }
  .playlist-name { font-size: 24px; }
  .playlist-actions { width: 100%; flex-wrap: wrap; }
  .action-btn { flex: 1; justify-content: center; }
  .playlist-meta-row { font-size: 12px; }
  .list-headers { display: none; }
  .track-row { padding: 4px 6px; }
}

@media (min-width: 1700px) {
  .playlist-view { max-width: 1400px; }
}
</style>
