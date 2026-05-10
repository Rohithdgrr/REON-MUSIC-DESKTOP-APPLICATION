<template>
  <button
    @click.stop="handleToggle"
    class="favorite-btn"
    :class="{ active: isFav, loading: isToggling }"
    :disabled="isToggling"
    :title="isFav ? 'Remove from favorites' : 'Add to favorites'"
  >
    <svg v-if="isFav" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useFavoritesStore } from '../stores/favorites.js'
import { normalizeTrack } from '../utils/trackNormalizer.js'

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

const favoritesStore = useFavoritesStore()
const isToggling = ref(false)
const normalizedSong = computed(() => normalizeTrack(props.song))

const isFav = computed(() => {
  const song = normalizedSong.value

  if (song.id) {
    return favoritesStore.isFavorite(song.id) || favoritesStore.isFavoriteByVideoId(song.videoId)
  }
  return favoritesStore.isFavoriteByVideoId(song.videoId)
})

async function handleToggle() {
  if (isToggling.value) return

  isToggling.value = true
  try {
    await favoritesStore.toggleFavorite(normalizedSong.value)
  } finally {
    isToggling.value = false
  }
}
</script>

<style scoped>
.favorite-btn {
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
  transition: all var(--transition-fast);
}

.favorite-btn svg {
  width: 20px;
  height: 20px;
}

.favorite-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: scale(1.1);
}

.favorite-btn.active {
  color: var(--color-primary);
}

.favorite-btn.active:hover {
  color: var(--color-primary-dark);
}

.favorite-btn.loading {
  opacity: 0.6;
  cursor: progress;
  transform: none;
}

.favorite-btn:disabled {
  pointer-events: none;
}
</style>
