<template>
  <button
    @click.stop="handleToggle"
    class="download-btn"
    :class="{ downloaded: isDownloaded }"
    :title="isDownloaded ? 'Downloaded' : 'Download'"
  >
    <svg v-if="isDownloaded" class="check-anim" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDownloadsStore } from '../stores/downloads.js'

const props = defineProps({
  song: { type: Object, required: true }
})

const downloadsStore = useDownloadsStore()
const isDownloaded = ref(false)

watch(() => props.song?.videoId, async (id) => {
  if (id) {
    isDownloaded.value = await downloadsStore.isDownloaded(id)
  }
}, { immediate: true })

async function handleToggle() {
  if (isDownloaded.value) {
    const dl = downloadsStore.downloadedSongs.find(d => d.videoId === props.song.videoId)
    if (dl && confirm('Remove this download?')) {
      await downloadsStore.removeDownload(dl.id)
      isDownloaded.value = false
    }
  } else {
    const success = await downloadsStore.addDownload(props.song)
    if (success) {
      isDownloaded.value = true
    }
  }
}
</script>

<style scoped>
.download-btn {
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

.download-btn svg {
  width: 18px;
  height: 18px;
}

.download-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.download-btn.downloaded {
  color: var(--color-success);
}

.download-btn:active svg {
  animation: downloadBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-anim {
  animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes downloadBounce {
  0% { transform: translateY(0); }
  30% { transform: translateY(4px); }
  60% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}
</style>
