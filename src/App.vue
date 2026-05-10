<template>
  <div class="app-container">
    <div class="background-glow">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>

    <Sidebar />
    <main class="main-content" :class="{ 'has-player': player.currentTrack }">
      <router-view />
    </main>
    <PlayerBar @toggleQueue="isQueueOpen = !isQueueOpen" />
    <QueuePanel :isOpen="isQueueOpen" @close="isQueueOpen = false" />
    <NotificationContainer />
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
import QueuePanel from './components/QueuePanel.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { usePlayerStore } from './stores/player.js'
import { useFavoritesStore } from './stores/favorites.js'
import { useMediaKeys } from './composables/useMediaKeys.js'
import { useTheme } from './composables/useTheme.js'
import { useNotifications } from './composables/useNotifications.js'
import { onMounted, ref } from 'vue'

const player = usePlayerStore()
const favoritesStore = useFavoritesStore()
useMediaKeys(player)

const { loadTheme } = useTheme()
const { requestPermission } = useNotifications()

const electronReady = ref(false)
const apiCheckAttempts = ref(0)
const isQueueOpen = ref(false)

// Debug: Check if window.electron is available
onMounted(() => {
  // Initialize theme
  loadTheme()
  
  // Request notification permission
  requestPermission()

  favoritesStore.loadFavorites().catch(err => {
    console.error('Failed to initialize favorites:', err)
  })
  
  console.log('=== Electron API Check ===')
  
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    console.log('window.electron:', window.electron)
    console.log('window.electron?.innertube:', window.electron?.innertube)
    console.log('window.electron?.sqlite:', window.electron?.sqlite)
    
    const checkInterval = setInterval(() => {
      apiCheckAttempts.value++
      
      if (window.electron?.innertube && window.electron?.sqlite) {
        electronReady.value = true
        clearInterval(checkInterval)
        console.log('✅ Electron API is now available!')
      } else if (apiCheckAttempts.value >= 50) {
        clearInterval(checkInterval)
        console.error('❌ Electron API never became available')
        console.log('window keys:', Object.keys(window))
        
        // Force check one more time
        if (window.electron) {
          console.log('But window.electron exists:', window.electron)
          electronReady.value = true
        }
      }
    }, 100)
  }, 100)
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-background);
  position: relative;
  overflow: hidden;
}

.background-glow {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 1;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%);
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%);
  bottom: -200px;
  left: 200px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 40px 0 40px;
  margin-left: var(--sidebar-width);
  margin-right: 0;
  margin-bottom: 0;
  position: relative;
  z-index: 10;
  transition: margin-right var(--transition-normal);
}

.main-content.has-player {
  margin-right: var(--player-sidebar-width);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 0 16px;
    margin-bottom: 80px;
  }
}
</style>
