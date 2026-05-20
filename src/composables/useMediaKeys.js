import { onMounted, onUnmounted } from 'vue'

export function useMediaKeys(player, options = {}) {
  const { router, toggleQueue, focusSearch } = options

  const handleKeyPress = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
      if (event.key === 'Escape') {
        event.target.blur()
      }
      return
    }

    const ctrl = event.ctrlKey || event.metaKey

    switch (event.key) {
      case ' ':
        event.preventDefault()
        player.togglePlay()
        break

      case 'ArrowRight':
        if (ctrl) {
          event.preventDefault()
          player.playNext()
        } else {
          event.preventDefault()
          player.seekTo(Math.min(100, player.progressPercent + 5))
        }
        break

      case 'ArrowLeft':
        if (ctrl) {
          event.preventDefault()
          player.playPrevious()
        } else {
          event.preventDefault()
          player.seekTo(Math.max(0, player.progressPercent - 5))
        }
        break

      case 'ArrowUp':
        if (ctrl) {
          event.preventDefault()
          player.setVolume(Math.min(1, player.volume + 0.1))
        }
        break

      case 'ArrowDown':
        if (ctrl) {
          event.preventDefault()
          player.setVolume(Math.max(0, player.volume - 0.1))
        }
        break

      case 'm':
      case 'M':
        event.preventDefault()
        player.setVolume(player.volume > 0 ? 0 : 0.8)
        break

      case 's':
      case 'S':
        if (!ctrl) {
          event.preventDefault()
          player.toggleShuffle()
        }
        break

      case 'r':
      case 'R':
        if (!ctrl) {
          event.preventDefault()
          player.cycleRepeatMode()
        }
        break

      case 'q':
      case 'Q':
        if (!ctrl && toggleQueue) {
          event.preventDefault()
          toggleQueue()
        }
        break

      case '/':
        if (!ctrl && focusSearch) {
          event.preventDefault()
          focusSearch()
        }
        break

      case 'Escape':
        if (toggleQueue) {
          toggleQueue(false)
        }
        break
    }

    if (ctrl) {
      switch (event.key) {
        case 'h':
        case 'H':
          event.preventDefault()
          router?.push('/')
          break
        case 'f':
        case 'F':
          event.preventDefault()
          router?.push('/search')
          break
        case 'l':
        case 'L':
          event.preventDefault()
          router?.push('/library')
          break
        case 'd':
        case 'D':
          event.preventDefault()
          router?.push('/favorites')
          break
        case ',':
          event.preventDefault()
          router?.push('/settings')
          break
        case '/':
          event.preventDefault()
          router?.push('/shortcuts')
          break
      }
    }

    if (event.key.startsWith('Media')) {
      event.preventDefault()
      switch (event.key) {
        case 'MediaPlayPause':
          player.togglePlay()
          break
        case 'MediaTrackNext':
          player.playNext()
          break
        case 'MediaTrackPrevious':
          player.playPrevious()
          break
        case 'MediaStop':
          player.stop()
          break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
}
