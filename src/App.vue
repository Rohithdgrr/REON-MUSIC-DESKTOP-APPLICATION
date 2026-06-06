<template>
  <div class="app-container" @error.capture="onErrorCaptured">
    <div class="background-glow">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>

    <Transition name="error-fade">
      <div v-if="error" class="error-banner" role="alert">
        <span class="error-message">{{ error.message }}</span>
        <div class="error-actions">
          <button class="error-btn" @click="dismissError">Dismiss</button>
          <button class="error-btn primary" @click="reloadApp">Reload</button>
        </div>
      </div>
    </Transition>

    <button v-show="!isSidebarOpen" class="sidebar-toggle" @click="isSidebarOpen = !isSidebarOpen" :class="{ open: isSidebarOpen }" title="Open sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
    <div v-if="isSidebarOpen && isNarrow" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>
    <Sidebar :isOpen="isSidebarOpen" @toggle="isSidebarOpen = !isSidebarOpen" @resize="onSidebarResize" />
    <main class="main-content" :class="mainClasses" :style="mainContentStyle">
      <router-view v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
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
import { useBreakpoint } from './composables/useBreakpoint.js'
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorBoundary } from './composables/useErrorBoundary.js'

const { error, captureError, dismissError } = useErrorBoundary()

const router = useRouter()
const player = usePlayerStore()
const favoritesStore = useFavoritesStore()
const { isNarrow, isUltrawide, isLarge } = useBreakpoint()

function toggleQueue(open) {
  if (typeof open === 'boolean') {
    isQueueOpen.value = open
  } else {
    isQueueOpen.value = !isQueueOpen.value
  }
}

function onErrorCaptured(e) {
  if (!e?.defaultPrevented) {
    captureError(e, null, 'dom-event')
  }
}

function reloadApp() {
  window.location.reload()
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

const mainClasses = computed(() => ({
  'has-player': !!player.currentTrack,
  'narrow': isNarrow.value,
  'ultrawide': isUltrawide.value,
  'large': isLarge.value && !isUltrawide.value
}))

const mainContentStyle = computed(() => {
  if (isNarrow.value) {
    return { marginLeft: '0', marginRight: '0' }
  }
  if (isUltrawide.value) {
    const rightPx = isQueueOpen.value
      ? queueWidth.value
      : (player.currentTrack ? 320 : 0)
    return {
      marginLeft: isSidebarOpen.value ? sidebarWidth.value + 'px' : '0',
      marginRight: rightPx + 'px',
      paddingLeft: '60px',
      paddingRight: '60px'
    }
  }
  return {
    marginLeft: isSidebarOpen.value ? sidebarWidth.value + 'px' : '0',
    marginRight: isQueueOpen.value
      ? queueWidth.value + 'px'
      : (player.currentTrack ? '300px' : '0')
  }
})

// Auto-collapse panels on narrow screens
watch(isNarrow, (now) => {
  if (now) {
    isSidebarOpen.value = false
    isQueueOpen.value = false
  }
})

// Auto-close sidebar on route change at narrow widths
watch(() => router.currentRoute.value.fullPath, () => {
  if (isNarrow.value && isSidebarOpen.value) {
    isSidebarOpen.value = false
  }
})

// Desktop notification on track change
watch(() => player.currentTrack, (track) => {
  if (track && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(track.title, {
      body: track.artist || 'Now Playing',
      icon: track.thumbnail || undefined
    })
  }
})

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

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 40px;
  position: relative;
  z-index: 10;
  transition: margin-left var(--transition-spring), margin-right var(--transition-normal);
}

.main-content.narrow {
  padding: 0 12px;
  padding-bottom: 80px;
}

.main-content.ultrawide {
  max-width: 1600px;
  margin-left: auto !important;
  margin-right: auto !important;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 49;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--color-danger, #e74c3c);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}
.error-message { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.error-actions { display: flex; gap: 8px; flex-shrink: 0; }
.error-btn {
  padding: 4px 14px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 6px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
}
.error-btn:hover { background: rgba(255,255,255,0.15); }
.error-btn.primary { background: #fff; color: var(--color-danger, #e74c3c); border-color: #fff; }
.error-btn.primary:hover { background: rgba(255,255,255,0.9); }
.error-fade-enter-active, .error-fade-leave-active { transition: opacity 0.3s; }
.error-fade-enter-from, .error-fade-leave-to { opacity: 0; }

.page-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 600px) {
  .sidebar-toggle {
    top: 8px;
    left: 8px;
  }
}
</style>
