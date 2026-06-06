<template>
  <div class="playlist-picker" @click.stop>
    <button class="picker-btn" @click.stop="showPicker = !showPicker" title="Add to playlist">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14"/><path d="M5 12h14"/>
      </svg>
    </button>

    <transition name="fade">
      <div v-if="showPicker" class="picker-popup" @click.stop>
        <div class="picker-header">
          <span>Add to playlist</span>
          <button class="picker-close" @click="showPicker = false">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div v-if="loading" class="picker-loading">Loading...</div>
        <div v-else-if="playlists.length === 0" class="picker-empty">
          <p>No playlists yet</p>
          <button class="create-btn" @click="createAndAdd">Create new</button>
        </div>
        <div v-else class="picker-list">
          <button
            v-for="pl in playlists"
            :key="pl.id"
            class="picker-item"
            @click="addTo(pl)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span>{{ pl.name }}</span>
          </button>
          <div class="picker-divider"></div>
          <button class="picker-item new" @click="createAndAdd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New playlist</span>
          </button>
        </div>
      </div>
    </transition>

    <div v-if="showPicker" class="picker-overlay" @click="showPicker = false"></div>
    <CreatePlaylistModal v-model:show="showCreateModal" @created="onPlaylistCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLibraryStore } from '../stores/library.js'
import { useNotifications } from '../composables/useNotifications.js'
import CreatePlaylistModal from './CreatePlaylistModal.vue'

const props = defineProps({
  song: { type: Object, required: true }
})

const library = useLibraryStore()
const { showNotification } = useNotifications()
const showPicker = ref(false)
const loading = ref(false)
const playlists = ref([])
const showCreateModal = ref(false)

onMounted(() => {
  loadPlaylists()
})

function loadPlaylists() {
  loading.value = true
  playlists.value = library.playlists
  loading.value = false
}

async function addTo(playlist) {
  try {
    const normalized = {
      videoId: props.song.videoId || props.song.video_id,
      title: props.song.title,
      artist: props.song.artist,
      thumbnail: props.song.thumbnail || props.song.thumbnail_url || '',
      duration: props.song.duration || 0
    }
    const addResult = await library.addSong(normalized)
    if (addResult) {
      const songId = library.songs.find(s => s.video_id === normalized.videoId)?.id
      if (songId) {
        await library.addSongToPlaylist(playlist.id, songId, 0)
        showNotification({ title: 'Added', message: `${normalized.title} added to ${playlist.name}`, type: 'success' })
      }
    }
  } catch (err) {
    showNotification({ title: 'Error', message: 'Failed to add song', type: 'error' })
  }
  showPicker.value = false
}

async function createAndAdd() {
  showPicker.value = false
  showCreateModal.value = true
}

async function onPlaylistCreated(playlist) {
  playlists.value = library.playlists
  await addTo(playlist)
}
</script>

<style scoped>
.playlist-picker {
  position: relative;
  display: inline-flex;
}

.picker-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}
.picker-btn svg { width: 18px; height: 18px; }
.picker-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--color-text);
  transform: translateY(-1px);
}

.picker-overlay {
  position: fixed; inset: 0; z-index: 999;
}

.picker-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: rgba(17, 24, 39, 0.92);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.picker-close {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: 50%;
}
.picker-close svg { width: 16px; height: 16px; }
.picker-close:hover { background: var(--color-surface-hover); }

.picker-loading,
.picker-empty {
  padding: var(--space-lg);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.create-btn {
  margin-top: 10px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.picker-list {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
  transition: background var(--transition-fast);
}
.picker-item svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-primary); }
.picker-item:hover { background: rgba(255, 255, 255, 0.06); }

.picker-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 14px;
}

.picker-item.new { color: var(--color-primary); font-weight: 600; }
</style>
