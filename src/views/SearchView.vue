<template>
  <div class="search-view">
    <header class="page-header">
      <div>
        <h1 class="page-title">Search</h1>
        <p class="page-sub">Find music across your library</p>
      </div>
    </header>

    <div class="search-box-row">
      <div class="search-box" :class="{ focused: isFocused || query }">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="query"
          @keyup.enter="search"
          @focus="isFocused = true"
          @blur="isFocused = false"
          type="text"
          placeholder="Search songs, artists, albums..."
          class="search-input"
          ref="searchInput"
        />
        <button v-if="query" class="clear-btn" @click="clearSearch" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <button class="search-btn" @click="search" :disabled="searchStore.isLoading || !query.trim()">
        {{ searchStore.isLoading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <Transition name="fade">
      <div v-if="searchStore.query && !searchStore.isLoading && !searchStore.error && filteredResults.length > 0">
        <!-- Results header -->
        <div class="results-header">
          <div>
            <h2 class="section-title">Results for "{{ searchStore.query }}"</h2>
            <span class="results-count">{{ filteredResults.length }} tracks</span>
          </div>
          <div class="results-actions">
            <button v-if="filteredResults.length > 0" class="play-all-btn" @click="playAll">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Play All
            </button>
          </div>
        </div>

        <!-- Artists from results -->
        <div v-if="artistList.length > 1" class="artists-strip">
          <div
            v-for="artist in artistList"
            :key="artist.name"
            class="artist-chip"
            @click="searchArtist(artist.name)"
          >
            <div class="chip-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="chip-name">{{ artist.name }}</span>
            <span class="chip-count">{{ artist.count }}</span>
          </div>
        </div>

        <!-- Batch action bar -->
        <Transition name="fade">
          <div v-if="selectedTracks.size > 0" class="batch-bar">
            <span class="batch-count">{{ selectedTracks.size }} selected</span>
            <button class="batch-btn" @click="batchAddToQueue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Queue
            </button>
            <button class="batch-btn secondary" @click="clearSelection">Clear</button>
          </div>
        </Transition>

        <!-- Track results -->
        <div class="track-list">
          <RecycleScroller
            :items="filteredResults"
            :item-size="72"
            key-field="videoId"
            class="track-list-inner"
            v-slot="{ item }"
          >
            <TrackCard
              :track="item"
              :selected="selectedTracks.has(item.videoId)"
              @play="handlePlay"
              @select="toggleSelect"
            />
          </RecycleScroller>
        </div>

        <!-- Load More -->
        <div v-if="hasMoreResults" class="load-more-row">
          <button class="load-more-btn" @click="loadMore" :disabled="searchStore.isLoading">
            {{ searchStore.isLoading ? 'Loading...' : 'Show More' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="searchStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Searching...</span>
    </div>

    <!-- Error -->
    <div v-else-if="searchStore.error" class="error-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ searchStore.error }}</p>
    </div>

    <!-- Empty results -->
    <div v-else-if="searchStore.query && filteredResults.length === 0 && !searchStore.isLoading" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h3>No results for "{{ searchStore.query }}"</h3>
      <p>Try different keywords or browse categories</p>
    </div>

    <!-- Suggestions (no query) -->
    <div v-else class="suggestions">
      <div v-if="searchHistory.length > 0" class="suggestion-section">
        <div class="suggestion-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Recent Searches</span>
          <button class="clear-history-link" @click="clearHistory">Clear</button>
        </div>
        <div class="suggestion-chips">
          <button v-for="(item, i) in searchHistory" :key="i" class="suggestion-chip" @click="selectSuggestion(item)">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            {{ item }}
          </button>
        </div>
      </div>

      <div class="suggestion-section">
        <div class="suggestion-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>Trending</span>
        </div>
        <div class="suggestion-chips">
          <button v-for="s in trending" :key="s" class="suggestion-chip trending" @click="selectSuggestion(s)">
            {{ s }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '../stores/search.js'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'
import { useNotifications } from '../composables/useNotifications.js'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const playerStore = usePlayerStore()

const query = ref('')
const isFocused = ref(false)
const searchInput = ref(null)
const historyLimit = ref(20)
const selectedTracks = ref(new Map())

function toggleSelect(track) {
  if (selectedTracks.value.has(track.videoId)) {
    selectedTracks.value.delete(track.videoId)
  } else {
    selectedTracks.value.set(track.videoId, track)
  }
  selectedTracks.value = new Map(selectedTracks.value)
}

function batchAddToQueue() {
  const tracks = [...selectedTracks.value.values()]
  if (tracks.length > 0) {
    tracks.forEach(t => playerStore.addToQueue(t))
    const { showNotification } = useNotifications()
    showNotification({ title: 'Added to Queue', message: `${tracks.length} tracks added`, type: 'success' })
    selectedTracks.value = new Map()
  }
}

function clearSelection() {
  selectedTracks.value = new Map()
}

const trending = [
  'Trending songs 2024',
  'Arijit Singh',
  'Bollywood hits',
  'Romantic songs',
  'Party music',
  'Workout songs',
  'Chill vibes',
  'New releases'
]

// Search history from localStorage
const searchHistory = ref([])

onMounted(() => {
  loadHistory()
  // Auto-search from route query param
  if (route.query.q) {
    query.value = route.query.q
    searchStore.performSearch(query.value)
  }
})

watch(() => route.query.q, (q) => {
  if (q && q !== searchStore.query) {
    query.value = q
    searchStore.performSearch(q)
  }
})

function loadHistory() {
  try {
    const saved = localStorage.getItem('searchHistory')
    searchHistory.value = saved ? JSON.parse(saved) : []
  } catch { searchHistory.value = [] }
}

function saveHistory(q) {
  if (!q || searchHistory.value.includes(q)) return
  searchHistory.value.unshift(q)
  if (searchHistory.value.length > 10) searchHistory.value.pop()
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

function selectSuggestion(s) {
  query.value = s
  search()
}

function search() {
  if (!query.value.trim()) return
  saveHistory(query.value.trim())
  searchStore.performSearch(query.value.trim())
}

function clearSearch() {
  query.value = ''
  searchStore.clearResults()
  searchInput.value?.focus()
}

// Compute unique artists from results
const artistList = computed(() => {
  const counts = {}
  searchStore.results.forEach(t => {
    const name = t.artist || 'Unknown'
    counts[name] = (counts[name] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
})

const filteredResults = computed(() => {
  return searchStore.results.slice(0, historyLimit.value)
})

const hasMoreResults = computed(() => {
  return searchStore.results.length > historyLimit.value
})

function loadMore() {
  historyLimit.value += 20
}

function handlePlay(track) {
  const index = filteredResults.value.findIndex(t => t.videoId === track.videoId)
  playerStore.setQueue(filteredResults.value, index >= 0 ? index : 0)
  playerStore.playTrack(track)
}

function playAll() {
  if (filteredResults.value.length > 0) {
    playerStore.setQueue(filteredResults.value, 0)
    playerStore.playTrack(filteredResults.value[0])
  }
}

function searchArtist(name) {
  query.value = name
  search()
}
</script>

<style scoped>
.search-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
  margin: 0 0 4px 0;
}

.page-sub {
  font-size: 13px;
  color: var(--color-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

/* Search box */
.search-box-row {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 14px;
  gap: 10px;
  transition: all var(--transition-fast);
}

.search-box.focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 15px;
  padding: 12px 0;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.clear-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

.search-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Results */
.results-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.results-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.results-actions {
  display: flex;
  gap: 8px;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.play-all-btn svg {
  width: 16px;
  height: 16px;
}

.play-all-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.03);
}

/* Artist chips */
.artists-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.artists-strip::-webkit-scrollbar {
  height: 0;
}

.artist-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 6px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.artist-chip:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.chip-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.chip-avatar svg {
  width: 14px;
  height: 14px;
}

.chip-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.chip-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  padding: 1px 6px;
  border-radius: 8px;
}

/* Track list */
.track-list {
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  min-height: 200px;
}

.track-list-inner {
  height: calc(100vh - 320px);
}

.track-card {
  margin: 0;
}

.batch-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  margin-bottom: 12px;
}
.batch-count { font-size: 13px; font-weight: 600; margin-right: auto; }
.batch-btn {
  padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.3); background: transparent; color: white; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
}
.batch-btn svg { width: 14px; height: 14px; }
.batch-btn:hover { background: rgba(255,255,255,0.15); }
.batch-btn.secondary { border-color: transparent; opacity: 0.8; }
.batch-btn.secondary:hover { opacity: 1; background: rgba(255,255,255,0.1); }

.load-more-row {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.load-more-btn {
  padding: 10px 28px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  text-align: center;
  color: var(--color-error);
}

.error-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.error-state p {
  font-size: 14px;
  margin: 0;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

.empty-state svg {
  width: 56px;
  height: 56px;
  opacity: 0.25;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 8px 0 0 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Suggestions */
.suggestions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}

.suggestion-head svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
}

.clear-history-link {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.clear-history-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.suggestion-chip svg {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
}

.suggestion-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.suggestion-chip.trending {
  font-weight: 600;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* === Responsive === */
@media (max-width: 480px) {
  .page-title { font-size: 20px; }
  .page-sub { font-size: 11px; letter-spacing: 0.4px; }
  .search-box-row { flex-direction: column; gap: 8px; }
  .search-btn { width: 100%; padding: 12px 20px; }
  .results-header { flex-direction: column; gap: 12px; align-items: stretch; }
  .play-all-btn { width: 100%; justify-content: center; }
  .batch-bar { flex-wrap: wrap; gap: 8px; }
  .batch-btn { flex: 1; }
}

@media (max-width: 600px) {
  .search-view { padding: 0; }
  .page-header { margin-bottom: 18px; padding-bottom: 12px; }
}

@media (max-width: 900px) {
  .search-box-row { flex-wrap: wrap; }
  .search-btn { padding: 12px 18px; }
}

@media (min-width: 1700px) {
  .search-view {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
