import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/library', name: 'library', component: () => import('../views/LibraryView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('../views/FavoritesView.vue') },

  { path: '/downloads', name: 'downloads', component: () => import('../views/DownloadsView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/shortcuts', name: 'shortcuts', component: () => import('../views/KeyboardShortcutsView.vue') },
  { path: '/playlist/:id', name: 'playlist', component: () => import('../views/PlaylistView.vue') },
  { path: '/category/:id', name: 'category', component: () => import('../views/CategoryView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
