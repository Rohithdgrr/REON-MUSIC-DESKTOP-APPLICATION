import { onMounted, onUnmounted } from 'vue'

/**
 * Composable for handling media keyboard shortcuts
 */
export function useMediaKeys(player) {
  const handleKeyPress = (event) => {
    // Don't trigger if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    switch (event.key) {
      case ' ':
        // Spacebar - play/pause
        event.preventDefault()
        player.togglePlay()
        break
      case 'ArrowRight':
        // Right arrow - seek forward 5s
        if (event.shiftKey) {
          player.playNext()
        } else {
          const newPercent = Math.min(100, player.progressPercent + 5)
          player.seekTo(newPercent)
        }
        break
      case 'ArrowLeft':
        // Left arrow - seek backward 5s
        if (event.shiftKey) {
          player.playPrevious()
        } else {
          const newPercent = Math.max(0, player.progressPercent - 5)
          player.seekTo(newPercent)
        }
        break
      case 'ArrowUp':
        // Up arrow - volume up
        event.preventDefault()
        player.setVolume(Math.min(1, player.volume + 0.1))
        break
      case 'ArrowDown':
        // Down arrow - volume down
        event.preventDefault()
        player.setVolume(Math.max(0, player.volume - 0.1))
        break
      case 'm':
      case 'M':
        // M - mute/unmute
        player.setVolume(player.volume > 0 ? 0 : 0.8)
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
}
