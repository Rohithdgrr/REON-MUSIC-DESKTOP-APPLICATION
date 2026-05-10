<template>
  <div class="search-view">
    <div class="search-header">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          v-model="query"
          @keyup.enter="search"
          type="text"
          placeholder="What do you want to listen to?"
          class="search-input"
        />
        <button v-if="query" class="clear-btn" @click="clear">&times;</button>
      </div>
      <button class="search-btn" @click="search" :disabled="searchStore.isLoading">
        Search
      </button>
      <button class="filter-btn" @click="showFilters = !showFilters" :class="{ active: hasActiveFilters }">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
        </svg>
      </button>
    </div>

    <!-- Smart Filters -->
    <transition name="slide">
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Duration</label>
          <select v-model="filters.duration">
            <option value="">Any</option>
            <option value="short">Short (< 4 min)</option>
            <option value="medium">Medium (4-10 min)</option>
            <option value="long">Long (> 10 min)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="filters.sortBy">
            <option value="relevance">Relevance</option>
            <option value="date">Upload Date</option>
            <option value="viewCount">View Count</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Type</label>
          <select v-model="filters.type">
            <option value="">All</option>
            <option value="song">Songs</option>
            <option value="video">Videos</option>
            <option value="album">Albums</option>
            <option value="playlist">Playlists</option>
          </select>
        </div>

        <button class="reset-filters-btn" @click="resetFilters" v-if="hasActiveFilters">
          Reset Filters
        </button>
      </div>
    </transition>

    <div v-if="searchStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Searching...</span>
    </div>

    <div v-else-if="searchStore.error" class="error-state">
      {{ searchStore.error }}
    </div>

    <div v-else-if="filteredResults.length > 0" class="results">
      <div class="results-header">
        <h2 class="section-title">Results for "{{ searchStore.query }}"</h2>
        <span class="results-count">{{ filteredResults.length }} results</span>
      </div>
      <div class="results-list">
        <TrackCard
          v-for="track in filteredResults"
          :key="track.videoId"
          :track="track"
          @play="handlePlay"
        />
      </div>
    </div>

    <div v-else-if="searchStore.query" class="empty-state">
      No results found for "{{ searchStore.query }}"
    </div>

    <div v-else class="empty-state">
      <p>Search for your favorite songs, artists, or albums</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSearchStore } from '../stores/search.js'
import { usePlayerStore } from '../stores/player.js'
import TrackCard from '../components/TrackCard.vue'

const searchStore = useSearchStore()
const playerStore = usePlayerStore()
const query = ref('')
const showFilters = ref(false)

const filters = ref({
  duration: '',
  sortBy: 'relevance',
  type: ''
})

const hasActiveFilters = computed(() => {
  return filters.value.duration !== '' || 
         filters.value.sortBy !== 'relevance' || 
         filters.value.type !== ''
})

const filteredResults = computed(() => {
  let results = [...searchStore.results]

  // Filter by duration
  if (filters.value.duration) {
    results = results.filter(track => {
      const duration = track.duration || 0
      if (filters.value.duration === 'short') return duration < 240
      if (filters.value.duration === 'medium') return duration >= 240 && duration <= 600
      if (filters.value.duration === 'long') return duration > 600
      return true
    })
  }

  // Filter by type
  if (filters.value.type) {
    results = results.filter(track => {
      // This is a simple filter - in a real app you'd have type info from the API
      return true // Keep all for now since we don't have type metadata
    })
  }

  // Sort results
  if (filters.value.sortBy !== 'relevance') {
    results.sort((a, b) => {
      if (filters.value.sortBy === 'date') {
        // Newer first (if we had date info)
        return 0
      }
      if (filters.value.sortBy === 'viewCount') {
        // More views first (if we had view count)
        return 0
      }
      if (filters.value.sortBy === 'rating') {
        // Higher rating first (if we had rating)
        return 0
      }
      return 0
    })
  }

  return results
})

async function search() {
  if (!query.value.trim()) return
  await searchStore.performSearch(query.value)
}

function clear() {
  query.value = ''
  searchStore.clearResults()
}

function resetFilters() {
  filters.value = {
    duration: '',
    sortBy: 'relevance',
    type: ''
  }
}

function handlePlay(track) {
  // Set queue from filtered results
  const index = filteredResults.value.findIndex(t => t.videoId === track.videoId)
  playerStore.setQueue(filteredResults.value, index)
  playerStore.playTrack(track)
}
</script>

<style scoped>
.search-view {
  max-width: 900px;
  margin: 0 auto;
}

.search-header {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  align-items: center;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 16px;
  gap: 12px;
}

.search-box:focus-within {
  border-color: var(--color-primary);
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
  padding: 14px 0;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.clear-btn:hover {
  color: var(--color-text);
}

.search-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: scale(1.02);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

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

.error-state {
  padding: 40px;
  text-align: center;
  color: var(--color-error);
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: var(--radius-md);
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 16px;
}

.filter-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn svg {
  width: 20px;
  height: 20px;
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.filters-panel {
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  gap: var(--space-lg);
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.filter-group select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.reset-filters-btn {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.results-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
