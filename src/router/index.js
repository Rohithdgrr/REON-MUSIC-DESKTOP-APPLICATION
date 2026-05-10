import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import LibraryView from '../views/LibraryView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import CategoryView from '../views/CategoryView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import RecentlyPlayedView from '../views/RecentlyPlayedView.vue'
import StatsView from '../views/StatsView.vue'
import SettingsView from '../views/SettingsView.vue'
import KeyboardShortcutsView from '../views/KeyboardShortcutsView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/library', name: 'library', component: LibraryView },
  { path: '/favorites', name: 'favorites', component: FavoritesView },
  { path: '/recent', name: 'recent', component: RecentlyPlayedView },
  { path: '/stats', name: 'stats', component: StatsView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/shortcuts', name: 'shortcuts', component: KeyboardShortcutsView },
  { path: '/playlist/:id', name: 'playlist', component: PlaylistView },
  { path: '/category/:id', name: 'category', component: CategoryView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
