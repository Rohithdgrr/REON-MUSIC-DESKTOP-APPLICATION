import { ref } from 'vue'

const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  function showNotification({ title, message, type = 'info', duration = 3000 }) {
    const id = notificationId++
    const notification = {
      id,
      title,
      message,
      type,
      visible: true
    }
    
    notifications.value.push(notification)
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function showNowPlaying(track) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Now Playing', {
        body: `${track.title}\n${track.artist}`,
        icon: track.thumbnail || '/icon.png',
        tag: 'now-playing',
        silent: true
      })
    }
  }
  
  async function requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }
  
  return {
    notifications,
    showNotification,
    removeNotification,
    showNowPlaying,
    requestPermission
  }
}
