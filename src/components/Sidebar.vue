<template>
  <aside class="sidebar">
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <span class="logo-text">Music Reon</span>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'home' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </router-link>
      <router-link to="/search" class="nav-item" :class="{ active: $route.name === 'search' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search</span>
      </router-link>
      <router-link to="/library" class="nav-item" :class="{ active: $route.name === 'library' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Library</span>
      </router-link>
    </nav>

    <div class="divider"></div>

    <nav class="nav">
      <router-link to="/favorites" class="nav-item" :class="{ active: $route.name === 'favorites' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span>Favorites</span>
        <span v-if="favoriteCount > 0" class="badge">{{ favoriteCount }}</span>
      </router-link>
      <router-link to="/recent" class="nav-item" :class="{ active: $route.name === 'recent' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Recent</span>
      </router-link>
      <router-link to="/stats" class="nav-item" :class="{ active: $route.name === 'stats' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <span>Stats</span>
      </router-link>
    </nav>

    <div class="divider"></div>

    <div class="playlists">
      <div class="pl-header">
        <span>Playlists</span>
        <button class="add-btn" @click="createNewPlaylist" title="Create playlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div v-if="isLoading" class="muted-text">Loading...</div>
      <div v-else-if="playlists.length === 0" class="muted-text">No playlists yet</div>
      <div v-else class="pl-list">
        <router-link v-for="p in playlists" :key="p.id" :to="`/playlist/${p.id}`" class="pl-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span>{{ p.name }}</span>
        </router-link>
      </div>
    </div>

    <div class="sidebar-foot">
      <ThemeToggle />
      <router-link to="/settings" class="foot-btn" title="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useLibraryStore } from '../stores/library.js'
import { useFavoritesStore } from '../stores/favorites.js'
import ThemeToggle from './ThemeToggle.vue'
import { storeToRefs } from 'pinia'

const library = useLibraryStore()
const favorites = useFavoritesStore()
const { playlists, isLoading } = storeToRefs(library)
const favoriteCount = computed(() => favorites.favoriteCount)

onMounted(() => { library.loadPlaylists(); favorites.loadFavorites() })

async function createNewPlaylist() {
  const name = prompt('Enter playlist name:')
  if (name?.trim()) await library.createPlaylist(name.trim())
}
</script>

<style scoped>
.sidebar {
  position: fixed; left: 0; top: 0; width: var(--sidebar-width); height: 100vh;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-right: var(--glass-border); display: flex; flex-direction: column; padding: 20px 12px; z-index: 50;
}

.logo { display: flex; align-items: center; gap: 10px; padding: 0 10px; margin-bottom: 24px; }
.logo-mark {
  width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); flex-shrink: 0;
}
.logo-mark svg { width: 16px; height: 16px; color: white; }
.logo-text { font-size: 16px; font-weight: 700; color: var(--color-text); letter-spacing: -0.3px; }

.nav { display: flex; flex-direction: column; gap: 1px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px;
  color: var(--color-text-muted); text-decoration: none; font-size: 13px; font-weight: 500;
  transition: all 0.15s ease;
}
.nav-item svg { width: 18px; height: 18px; flex-shrink: 0; stroke-width: 1.8; }
.nav-item:hover { color: var(--color-text); background: var(--color-surface-hover); }
.nav-item.active { color: var(--color-primary); background: rgba(249,115,22,0.08); font-weight: 600; }
.nav-item.active svg { color: var(--color-primary); }

.badge {
  margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 100px;
  background: rgba(249,115,22,0.15); color: var(--color-primary);
}

.divider { height: 1px; background: var(--color-border); margin: 10px 12px; }

.playlists { flex: 1; overflow-y: auto; min-height: 0; }
.pl-header {
  display: flex; align-items: center; justify-content: space-between; padding: 0 12px; margin-bottom: 6px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--color-text-muted);
}
.add-btn {
  background: none; border: none; color: var(--color-text-muted); cursor: pointer;
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  border-radius: 4px; transition: all 0.15s ease;
}
.add-btn svg { width: 14px; height: 14px; }
.add-btn:hover { color: var(--color-primary); background: rgba(249,115,22,0.08); }

.muted-text { padding: 0 12px; font-size: 11px; color: var(--color-text-muted); }

.pl-list { display: flex; flex-direction: column; }
.pl-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; font-weight: 500;
  color: var(--color-text-muted); text-decoration: none; border-radius: 6px; transition: all 0.15s ease;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pl-item svg { width: 14px; height: 14px; flex-shrink: 0; opacity: 0.5; }
.pl-item:hover { color: var(--color-text); background: var(--color-surface-hover); }
.pl-item:hover svg { opacity: 1; color: var(--color-primary); }

.sidebar-foot {
  padding-top: 10px; border-top: 1px solid var(--color-border); margin-top: auto;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.foot-btn {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border-radius: 6px; color: var(--color-text-muted); transition: all 0.15s ease;
}
.foot-btn svg { width: 16px; height: 16px; }
.foot-btn:hover { color: var(--color-primary); background: rgba(249,115,22,0.08); }
</style>
