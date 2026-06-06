import { computed, ref, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { useNotifications } from '../composables/useNotifications.js'
import { normalizeTrack, normalizeTrackList } from '../utils/trackNormalizer.js'
import { formatDuration, formatDurationLong } from '../utils/queueFormat.js'

const BROKEN_IMAGE_CLEANUP_THRESHOLD = 50

let sharedBrokenImages = null
let sharedBrokenImagesAdds = 0
let brokenImagesResetTimer = null

function getBrokenImages() {
  if (!sharedBrokenImages) {
    sharedBrokenImages = ref(new Set())
  }
  return sharedBrokenImages
}

function noteBrokenImage(url) {
  if (!url) return
  const set = getBrokenImages().value
  set.add(url)
  sharedBrokenImagesAdds += 1
  if (sharedBrokenImagesAdds >= BROKEN_IMAGE_CLEANUP_THRESHOLD) {
    set.clear()
    sharedBrokenImagesAdds = 0
  }
}

function registerResetTimer() {
  if (brokenImagesResetTimer) return
  brokenImagesResetTimer = setInterval(() => {
    if (sharedBrokenImagesAdds > 0) {
      sharedBrokenImages?.value?.clear()
      sharedBrokenImagesAdds = 0
    }
  }, 5 * 60 * 1000)
}

export function useQueue() {
  const player = usePlayerStore()
  const library = useLibraryStore()
  const { showNotification } = useNotifications()

  registerResetTimer()

  const { queue, currentIndex, currentTrack } = storeToRefs(player)

  const brokenImages = getBrokenImages()
  function handleImageError(url) {
    noteBrokenImage(url)
  }

  const track = computed(() => normalizeTrack(currentTrack.value || {}))
  const queueTracks = computed(() => normalizeTrackList(queue.value))
  const queueCount = computed(() => queueTracks.value.length)
  const currentTrackPosition = computed(() =>
    currentTrack.value ? currentIndex.value + 1 : 0
  )

  const playedSongs = computed(() => {
    return queueTracks.value.slice(0, currentIndex.value)
  })

  const upcomingSongs = computed({
    get: () => queueTracks.value.slice(currentIndex.value + 1),
    set: (value) => {
      const newQueue = [
        ...queueTracks.value.slice(0, currentIndex.value + 1),
        ...value
      ]
      player.setQueue(newQueue, currentIndex.value)
    }
  })

  const totalDuration = computed(() => {
    const total = queue.value.reduce((sum, item) => sum + (item.duration || 0), 0)
    return formatDuration(total)
  })

  const totalDurationLong = computed(() => {
    const total = queue.value.reduce((sum, item) => sum + (item.duration || 0), 0)
    return formatDurationLong(total)
  })

  function playQueueItem(item) {
    const selectedIndex = queueTracks.value.findIndex(
      (t) => t.videoId === item.videoId
    )
    if (selectedIndex < 0) return
    player.setQueue(queueTracks.value, selectedIndex)
    player.playTrack(queueTracks.value[selectedIndex])
  }

  function removeFromQueue(index) {
    const actualIndex = currentIndex.value + 1 + index
    if (actualIndex < 0 || actualIndex >= queue.value.length) return
    const newQueue = queue.value.filter((_, i) => i !== actualIndex)
    const newIndex =
      actualIndex > currentIndex.value ? currentIndex.value : currentIndex.value - 1
    player.setQueue(newQueue, newIndex)
  }

  function moveQueueItem(fromIndex, toIndex) {
    const actualFrom = currentIndex.value + 1 + fromIndex
    const actualTo = currentIndex.value + 1 + toIndex
    if (
      actualFrom < 0 ||
      actualFrom >= queue.value.length ||
      actualTo < 0 ||
      actualTo >= queue.value.length
    )
      return
    const newQueue = [...queue.value]
    const [moved] = newQueue.splice(actualFrom, 1)
    newQueue.splice(actualTo, 0, moved)
    player.setQueue(newQueue, currentIndex.value)
  }

  function moveToTop(index) {
    moveQueueItem(index, 0)
  }

  function moveToBottom(index) {
    moveQueueItem(index, upcomingSongs.value.length - 1)
  }

  function clearQueue() {
    if (queue.value.length === 0) return
    if (typeof window !== 'undefined' && window.confirm('Clear entire queue?')) {
      player.clearQueue()
      showNotification({ title: 'Queue Cleared', type: 'info' })
    }
  }

  async function saveQueueAsPlaylist(name) {
    if (!name?.trim()) return
    const result = await library.createPlaylist(name.trim())
    if (!result.success) {
      showNotification({
        title: 'Failed to save',
        message: result.error,
        type: 'error'
      })
      return null
    }
    for (let i = 0; i < queueTracks.value.length; i++) {
      const t = queueTracks.value[i]
      await library.addSong({
        videoId: t.videoId,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail || '',
        duration: t.duration || 0
      })
      const songId = library.songs.find((s) => s.video_id === t.videoId)?.id
      if (songId) {
        await library.addSongToPlaylist(result.data.id, songId, i)
      }
    }
    showNotification({
      title: 'Playlist Saved',
      message: `"${name.trim()}" with ${queueTracks.value.length} songs`,
      type: 'success'
    })
    return result.data
  }

  function addHistoryToQueue(item) {
    const track = normalizeTrack(item)
    if (!track.videoId) return
    player.addToQueue({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail || track.thumbnail_url || '',
      duration: track.duration || track.duration_seconds || 0
    })
    showNotification({
      title: 'Added to queue',
      message: track.title,
      type: 'success'
    })
  }

  function playHistoryNow(item) {
    const t = normalizeTrack(item)
    if (!t.videoId) return
    const newQueue = [
      ...queueTracks.value.slice(0, currentIndex.value + 1),
      {
        videoId: t.videoId,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail || t.thumbnail_url || '',
        duration: t.duration || t.duration_seconds || 0
      }
    ]
    player.setQueue(newQueue, currentIndex.value + 1)
    player.playTrack(newQueue[currentIndex.value + 1])
  }

  return {
    player,
    library,
    brokenImages,
    handleImageError,
    track,
    queueTracks,
    queueCount,
    currentTrackPosition,
    upcomingSongs,
    playedSongs,
    totalDuration,
    totalDurationLong,
    playQueueItem,
    removeFromQueue,
    moveToTop,
    moveToBottom,
    clearQueue,
    saveQueueAsPlaylist,
    addHistoryToQueue,
    playHistoryNow
  }
}
