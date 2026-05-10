<template>
  <div class="playlist-view">
    <div v-if="playlist" class="playlist-header">
      <div class="playlist-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
      </div>
      <div class="playlist-meta">
        <span class="playlist-label">Playlist</span>
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <span class="song-count">{{ songs.length }} songs</span>
      </div>
    </div>

    <div v-if="songs.length > 0" class="track-list">
      <TrackCard
        v-for="song in songs"
        :key="song.id"
        :track="{
          videoId: song.video_id,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail_url,
          duration: song.duration_seconds
        }"
        @play="handlePlay"
      />
    </div>
    <div v-else class="empty-state">
      This playlist is empty. Add songs from search!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'

const route = useRoute()
const player = usePlayerStore()

const playlist = ref(null)
const songs = ref([])

onMounted(async () => {
  const playlistId = parseInt(route.params.id)
  try {
    const result = await window.electron.sqlite.getPlaylists()
    if (result.success) {
      playlist.value = result.data.find(p => p.id === playlistId)
    }
    const songsResult = await window.electron.sqlite.getPlaylistSongs(playlistId)
    if (songsResult.success) {
      songs.value = songsResult.data
    }
  } catch (err) {
    console.error('Failed to load playlist:', err)
  }
})

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
</script>

<style scoped>
.playlist-view {
  max-width: 900px;
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
  width: 180px;
  height: 180px;
  background-color: var(--color-surface-hover);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.playlist-icon svg {
  width: 64px;
  height: 64px;
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
  font-size: 48px;
  font-weight: 700;
  margin: 8px 0;
  color: var(--color-text);
}

.song-count {
  font-size: 14px;
  color: var(--color-text-muted);
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-muted);
}
</style>
