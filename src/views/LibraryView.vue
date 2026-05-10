<template>
  <div class="library-view">
    <h1 class="page-title">Your Library</h1>

    <div v-if="library.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else>
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Saved Songs</h2>
          <span class="count">{{ library.songs.length }} songs</span>
        </div>
        <div v-if="library.songs.length === 0" class="empty-text">
          No saved songs yet. Start listening to build your library!
        </div>
        <div v-else class="track-list">
          <TrackCard
            v-for="song in library.songs"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'

const library = useLibraryStore()
const player = usePlayerStore()

onMounted(() => {
  library.loadSongs()
})

function handlePlay(track) {
  player.setQueue([track], 0)
  player.playTrack(track)
}
</script>

<style scoped>
.library-view {
  max-width: 900px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--color-text);
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.count {
  font-size: 14px;
  color: var(--color-text-muted);
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-text {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
