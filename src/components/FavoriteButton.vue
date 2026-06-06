<template>
  <button
    @click.stop="handleToggle"
    class="favorite-btn"
    :class="{ active: isFav, loading: isToggling, unfaving: isUnfaving }"
    :disabled="isToggling"
    :title="isFav ? 'Remove from favorites' : 'Add to favorites'"
  >
    <svg v-if="isFav" :key="'filled'" class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    <svg v-else :key="'outline'" class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
const isUnfaving = ref(false)
const normalizedSong = computed(() => normalizeTrack(props.song))

const isFav = computed(() => {
  const song = normalizedSong.value
  return favoritesStore.isFavoriteByVideoId(song.videoId)
})

async function handleToggle() {
  if (isToggling.value) return
  isToggling.value = true
  if (isFav.value) isUnfaving.value = true
  try {
    await favoritesStore.toggleFavorite(normalizedSong.value)
  } finally {
    isToggling.value = false
    isUnfaving.value = false
  }
}
</script>

<style scoped>
.favorite-btn {
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
  position: relative;
}

.favorite-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.favorite-btn svg {
  width: 18px;
  height: 18px;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--color-text);
  transform: translateY(-1px);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.favorite-btn.active {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.favorite-btn.active:hover {
  color: var(--color-primary);
}

.favorite-btn.loading {
  opacity: 0.6;
  cursor: progress;
  transform: none;
}

.favorite-btn:disabled {
  pointer-events: none;
}

.favorite-btn.active .heart-icon {
  animation: heartPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.favorite-btn.active:hover .heart-icon {
  animation: heartBeat 0.6s ease infinite;
}

.favorite-btn.unfaving.active .heart-icon {
  animation: heartBreak 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes heartPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes heartBreak {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.7); opacity: 0.6; }
  100% { transform: scale(0); opacity: 0; }
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.15); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
}
</style>
