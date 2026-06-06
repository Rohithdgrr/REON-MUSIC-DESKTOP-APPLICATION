<template>
  <div class="app-container">
    <div class="background-glow">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>

    <button class="sidebar-toggle" @click="isSidebarOpen = !isSidebarOpen" :class="{ open: isSidebarOpen }" title="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
    <Sidebar :isOpen="isSidebarOpen" @toggle="isSidebarOpen = !isSidebarOpen" @resize="onSidebarResize" />
    <main class="main-content" :class="{ 'has-player': player.currentTrack }" :style="{ marginLeft: isSidebarOpen ? sidebarWidth + 'px' : '0', marginRight: isQueueOpen ? queueWidth + 'px' : (player.currentTrack ? '300px' : '0') }">
      <router-view />
    </main>
    <PlayerBar @toggleQueue="isQueueOpen = !isQueueOpen" />
    <QueuePanel :isOpen="isQueueOpen" @close="isQueueOpen = false" @resize="onQueueResize" />
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
import { useRouter } from 'vue-router'

const router = useRouter()
const player = usePlayerStore()
const favoritesStore = useFavoritesStore()

function toggleQueue(open) {
  if (typeof open === 'boolean') {
    isQueueOpen.value = open
  } else {
    isQueueOpen.value = !isQueueOpen.value
  }
}

function focusSearch() {
  if (router.currentRoute?.value?.path !== '/search') {
    router.push('/search')
  }
  // Focus the search input after navigation
  setTimeout(() => {
    const input = document.querySelector('.search-box input')
    input?.focus()
  }, 100)
}

useMediaKeys(player, { router, toggleQueue, focusSearch })

const { loadTheme } = useTheme()
const { requestPermission } = useNotifications()

const electronReady = ref(false)
const apiCheckAttempts = ref(0)
const isQueueOpen = ref(false)
const isSidebarOpen = ref(true)
const sidebarWidth = ref(260)
const queueWidth = ref(380)

function onSidebarResize(width) {
  sidebarWidth.value = width
}

function onQueueResize(width) {
  queueWidth.value = width
}

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
  background: radial-gradient(circle, var(--color-orb-1) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  transition: background var(--transition-slow);
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-orb-2) 0%, transparent 70%);
  bottom: -200px;
  left: 200px;
  transition: background var(--transition-slow);
}

.sidebar-toggle {
  position: fixed;
  left: 8px;
  top: 10px;
  z-index: 60;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.sidebar-toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}
.sidebar-toggle svg {
  width: 18px;
  height: 18px;
}
.sidebar-toggle.open {
  left: calc(v-bind(sidebarWidth) * 1px + 8px);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 40px;
  position: relative;
  z-index: 10;
  transition: margin-left var(--transition-spring), margin-right var(--transition-normal);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding: 0 16px;
    margin-bottom: 80px;
  }
  
  .sidebar-toggle.open {
    left: 8px !important;
  }
}
</style>
