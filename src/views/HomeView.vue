<template>
  <div class="home">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Overview</h1>
        <p class="page-sub">Music Intelligence Center</p>
      </div>
      <div class="header-search-container">
        <div class="header-search" :class="{ focused: isSearchFocused || searchQuery }">
          <svg class="header-search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            @input="handleSearchInput"
            @keyup.enter="performSearch"
            @keydown.down.prevent="navigateResults('down')"
            @keydown.up.prevent="navigateResults('up')"
            @keydown.esc="clearSearch"
            type="text"
            placeholder="Search songs, artists, albums..."
            class="header-search-input"
            ref="searchInput"
          />
          <button v-if="searchQuery" @click="clearSearch" class="search-clear-btn" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <!-- Search Dropdown -->
        <div v-if="showSearchDropdown" class="search-dropdown">
          <!-- Search History -->
          <div v-if="!searchQuery && searchHistory.length > 0" class="search-section">
            <div class="search-section-header">
              <span>Recent Searches</span>
              <button @click="clearSearchHistory" class="clear-history-btn">Clear</button>
            </div>
            <div
              v-for="(item, index) in searchHistory"
              :key="'history-' + index"
              class="search-item"
              @click="selectHistoryItem(item)"
            >
              <svg class="search-item-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              <span class="search-item-text">{{ item }}</span>
              <button @click.stop="removeHistoryItem(index)" class="remove-history-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Live Search Results -->
          <div v-if="searchQuery && isSearching" class="search-section">
            <div class="search-loading">
              <div class="search-spinner"></div>
              <span>Searching...</span>
            </div>
          </div>
          
          <div v-if="searchQuery && !isSearching && searchResults.length > 0" class="search-section">
            <div class="search-section-header">
              <span>Results</span>
              <span class="result-count">{{ searchResults.length }} found</span>
            </div>
            <button
              v-for="(result, index) in searchResults.slice(0, 8)"
              :key="result.videoId"
              class="search-result-item"
              :class="{ selected: selectedResultIndex === index }"
              @click="selectResult(result)"
            >
              <img v-if="result.thumbnail && !brokenImages.has(result.thumbnail)" :src="result.thumbnail" @error="handleImageError(result.thumbnail)" class="result-thumb" alt="" />
              <div v-else class="result-thumb result-thumb-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div class="result-info">
                <span class="result-title">{{ result.title }}</span>
                <span class="result-artist">{{ result.artist }}</span>
              </div>
              <svg class="result-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button v-if="searchResults.length > 8" @click="viewAllResults" class="view-all-btn">
              View all {{ searchResults.length }} results
            </button>
          </div>
          
          <div v-if="searchQuery && !isSearching && searchResults.length === 0" class="search-section">
            <div class="search-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No results found for "{{ searchQuery }}"</p>
            </div>
          </div>
          
          <!-- Quick Suggestions -->
          <div v-if="!searchQuery" class="search-section">
            <div class="search-section-header">
              <span>Try Searching</span>
            </div>
            <div
              v-for="suggestion in quickSuggestions"
              :key="suggestion"
              class="search-item"
              @click="selectSuggestion(suggestion)"
            >
              <svg class="search-item-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <span class="search-item-text">{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>



    <!-- Discover Music - Data Vector equivalent -->
    <section class="section" style="margin-top: 24px;">
      <div class="card-header">
        <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
        <h3>Curated Vectors Aggregation</h3>
      </div>
      <div class="scroll-row">
        <div v-for="(c, i) in curatedCategories" :key="c.id" class="big-card" @click="searchCategory(c)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: c.gradient }">
            <img v-if="c.thumbnail && !brokenImages.has(c.thumbnail)" :src="c.thumbnail" @error="handleImageError(c.thumbnail)" class="cover-thumb" alt="" />
            <div class="cover-overlay"></div>
            <svg v-if="!c.thumbnail || brokenImages.has(c.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ c.name }}</span>
          <span class="card-desc">{{ c.description }}</span>
        </div>
      </div>
    </section>

    <!-- Best Tracks & Charts -->
    <section class="section">
      <div class="card-header">
        <div class="card-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <h3>Top Charts & Playlists</h3>
      </div>
      <div class="scroll-row">
        <div v-for="(track, i) in bestTracks" :key="track.id" class="big-card" @click="searchCategory(track)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: track.gradient }">
            <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" class="cover-thumb" alt="" />
            <div class="cover-overlay"></div>
            <svg v-if="!track.thumbnail || brokenImages.has(track.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ track.name }}</span>
          <span class="card-desc">{{ track.description }}</span>
        </div>
      </div>
    </section>

    <!-- Fresh Picks -->
    <section class="section">
      <div class="card-header">
        <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
        <h3>Fresh Picks</h3>
      </div>
      <div class="scroll-row">
        <div v-for="(pick, i) in freshPicks" :key="pick.id" class="big-card" @click="searchCategory(pick)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: pick.gradient }">
            <img v-if="pick.thumbnail && !brokenImages.has(pick.thumbnail)" :src="pick.thumbnail" @error="handleImageError(pick.thumbnail)" class="cover-thumb" alt="" />
            <div class="cover-overlay"></div>
            <svg v-if="!pick.thumbnail || brokenImages.has(pick.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ pick.name }}</span>
          <span class="card-desc">{{ pick.description }}</span>
        </div>
      </div>
    </section>

    <!-- Mood Mixes -->
    <section class="section">
      <div class="card-header">
        <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div>
        <h3>Mood Mixes</h3>
      </div>
      <div class="scroll-row">
        <div v-for="(mood, i) in smartPlaylistStore.moodPlaylists" :key="mood.id" class="big-card" @click="fetchAndShowMood(mood)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: moodGradients[i % moodGradients.length] }">
            <div class="cover-overlay"></div>
            <div class="mood-emoji">{{ moodEmojis[i % moodEmojis.length] }}</div>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ mood.name }}</span>
          <span class="card-desc">{{ mood.description }}</span>
        </div>
      </div>
    </section>

    <!-- Mood Results Panel -->
    <Transition name="panel-slide">
      <div v-if="activeMood && moodTracks.length > 0" class="mood-panel">
        <div class="mood-panel-header">
          <div>
            <h3 class="mood-panel-title">{{ activeMood.name }}</h3>
            <p class="mood-panel-desc">{{ moodTracks.length }} tracks</p>
          </div>
          <button @click="closeMoodPanel" class="mood-panel-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mood-panel-tracks">
          <TrackCard v-for="track in moodTracks" :key="track.videoId" :track="track" @play="handleMoodPlay" />
        </div>
      </div>
    </Transition>

    <!-- Top Artists -->
    <section class="section">
      <div class="card-header">
        <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <h3>Top Artists</h3>
      </div>
      <div class="scroll-row">
        <div v-for="(artist, i) in artists" :key="artist.id" class="big-card" @click="searchCategory(artist)" :style="{ animationDelay: i * 40 + 'ms' }">
          <div class="big-card-cover" :style="{ background: artist.gradient }">
            <img v-if="artist.thumbnail && !brokenImages.has(artist.thumbnail)" :src="artist.thumbnail" @error="handleImageError(artist.thumbnail)" class="cover-thumb" alt="" />
            <div class="cover-overlay"></div>
            <svg v-if="!artist.thumbnail || brokenImages.has(artist.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <span class="card-label">{{ artist.name }}</span>
          <span class="card-desc">Popular tracks</span>
        </div>
      </div>
    </section>

    <!-- Recently Played -->
    <section v-if="history.length > 0" class="section">
      <div class="section-head">
        <div class="section-icon recent"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg></div>
        <h2>Recently Played</h2>
      </div>
      <div class="track-list">
        <TrackCard v-for="(item, i) in history.slice(0, 5)" :key="'r'+item.id" :track="{ videoId: item.video_id, title: item.title, artist: item.artist, thumbnail: item.thumbnail_url, duration: item.duration_seconds }" @play="handlePlay" />
      </div>
    </section>

    <!-- Empty -->
    <section v-if="playlists.length === 0 && history.length === 0 && favList.length === 0" class="empty-state">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
      <h3>Start your musical journey</h3>
      <p>Explore the categories above to discover music</p>
    </section>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { storeToRefs } from 'pinia'
import TrackCard from '../components/TrackCard.vue'
import { normalizeTrack, normalizeTrackList } from '../utils/trackNormalizer.js'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { filterMusicContent } from '../utils/contentFilter.js'
import { useSmartPlaylistsStore } from '../stores/smartPlaylists.js'

const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()
const favStore = useFavoritesStore()
const smartPlaylistStore = useSmartPlaylistsStore()
const { history, playlists, songs } = storeToRefs(library)
const { currentTrack } = storeToRefs(player)

const searchQuery = ref('')
const isSearchFocused = ref(false)
const showSearchDropdown = ref(false)
const isSearching = ref(false)
const searchResults = ref([])
const searchHistory = ref([])
const selectedResultIndex = ref(-1)
const searchInput = ref(null)
let searchTimeout = null

const brokenImages = ref(new Set())
function handleImageError(url) {
  if (url) {
    brokenImages.value.add(url)
  }
}

// Mood playlists
const activeMood = ref(null)
const moodTracks = ref([])
const moodGradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  'linear-gradient(135deg, #f5576c, #ff6b6b)',
  'linear-gradient(135deg, #667eea, #764ba2)'
]
const moodEmojis = ['💪', '🎯', '😎', '🎉', '💕', '🚗', '🥺', '☀️', '🌙', '🙏']

async function fetchAndShowMood(mood) {
  activeMood.value = mood
  const tracks = await smartPlaylistStore.fetchMoodPlaylist(mood.id)
  moodTracks.value = tracks
}

function closeMoodPanel() {
  activeMood.value = null
  moodTracks.value = []
}

function handleMoodPlay(track) {
  if (moodTracks.value.length > 0) {
    player.setQueue(moodTracks.value, moodTracks.value.findIndex(t => t.videoId === track.videoId))
    player.playTrack(track)
  }
}

const quickSuggestions = [
  'Trending songs 2024',
  'Arijit Singh',
  'Bollywood hits',
  'Romantic songs',
  'Party music'
]

// Load search history from localStorage
onMounted(() => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    try {
      searchHistory.value = JSON.parse(saved)
    } catch (e) {
      searchHistory.value = []
    }
  }
})

// Watch for search focus
watch([isSearchFocused, searchQuery], ([focused, query]) => {
  showSearchDropdown.value = focused || query.length > 0
})

function handleSearchInput() {
  selectedResultIndex.value = -1
  
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  
  searchTimeout = setTimeout(async () => {
    await performLiveSearch()
  }, 500)
}

async function performLiveSearch() {
  if (!searchQuery.value.trim()) {
    isSearching.value = false
    return
  }
  
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const result = await electron.innertube.search(searchQuery.value.trim(), { type: 'video' })
    
    if (result.success && result.data && Array.isArray(result.data)) {
      const musicOnly = filterMusicContent(result.data)
      searchResults.value = musicOnly.slice(0, 20).map(item => {
        // Ensure we have all required fields
        const videoId = item.id || item.videoId
        const title = item.title || 'Unknown Title'
        const artist = item.author || item.artist || 'Unknown Artist'
        const thumbnail = item.thumbnails?.[0]?.url || item.thumbnail || ''
        const duration = item.duration || 0
        
        return {
          videoId,
          title,
          artist,
          thumbnail,
          duration
        }
      }).filter(item => item.videoId) // Filter out items without videoId
    } else {
      searchResults.value = []
    }
  } catch (err) {
    console.error('Search error:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function performSearch() {
  if (!searchQuery.value.trim()) return
  
  addToSearchHistory(searchQuery.value.trim())
  router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
  clearSearch()
}

async function selectResult(result) {
  try {
    if (!result || !result.videoId) {
      console.error('Invalid result:', result)
      return
    }
    
    addToSearchHistory(searchQuery.value.trim())
    
    // Create a properly formatted track object
    const track = {
      videoId: result.videoId,
      title: result.title || 'Unknown Title',
      artist: result.artist || 'Unknown Artist',
      thumbnail: result.thumbnail || '',
      duration: result.duration || 0
    }
    
    console.log('Playing track from search:', track)
    
    // Set queue and play
    player.setQueue([track], 0)
    await player.playTrack(track)
    
    clearSearch()
  } catch (err) {
    console.error('Error playing track from search:', err)
    error.value = 'Failed to play track: ' + err.message
  }
}

function selectHistoryItem(query) {
  searchQuery.value = query
  performSearch()
}

function selectSuggestion(suggestion) {
  searchQuery.value = suggestion
  performSearch()
}

function navigateResults(direction) {
  if (searchResults.value.length === 0) return
  
  if (direction === 'down') {
    selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, searchResults.value.length - 1)
  } else {
    selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, -1)
  }
  
  if (selectedResultIndex.value >= 0) {
    const result = searchResults.value[selectedResultIndex.value]
    if (result) {
      selectResult(result)
    }
  }
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  isSearchFocused.value = false
  showSearchDropdown.value = false
  selectedResultIndex.value = -1
  if (searchInput.value) {
    searchInput.value.blur()
  }
}

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false
    showSearchDropdown.value = false
  }, 200)
}

function addToSearchHistory(query) {
  if (!query || searchHistory.value.includes(query)) return
  
  searchHistory.value.unshift(query)
  searchHistory.value = searchHistory.value.slice(0, 10)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

function removeHistoryItem(index) {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

function clearSearchHistory() {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

function viewAllResults() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
    clearSearch()
  }
}

function goToSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search' })
  }
}

const normalizedHistory = computed(() => normalizeTrackList(history.value))
const normalizedSongs = computed(() => normalizeTrackList(songs.value))
const normalizedFavorites = computed(() => normalizeTrackList(favStore.favoriteSongs))

const relatedGroups = computed(() => {
  const track = currentTrack.value ? normalizeTrack(currentTrack.value) : null
  if (!track) return []

  const artistMatches = normalizedSongs.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const favoriteMatches = normalizedFavorites.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const recentMatches = normalizedHistory.value
    .filter(item => item.videoId !== track.videoId && item.artist.toLowerCase() === track.artist.toLowerCase())
    .slice(0, 4)

  const libraryMatches = normalizedSongs.value
    .filter(item => item.videoId !== track.videoId)
    .slice(0, 4)

  return [
    {
      id: 'artist',
      title: `More from ${track.artist}`,
      description: artistMatches.length > 0 ? 'Songs from your library' : 'No direct matches yet',
      count: artistMatches.length,
      thumbnails: artistMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: artistMatches.length > 0 ? artistMatches : libraryMatches
    },
    {
      id: 'favorites',
      title: 'Favorites nearby',
      description: favoriteMatches.length > 0 ? 'Songs you already love' : 'Your saved music',
      count: favoriteMatches.length,
      thumbnails: favoriteMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: favoriteMatches.length > 0 ? favoriteMatches : normalizedFavorites.value.slice(0, 4)
    },
    {
      id: 'recent',
      title: 'Recently played',
      description: recentMatches.length > 0 ? 'Similar items from history' : 'Recent listening activity',
      count: recentMatches.length,
      thumbnails: recentMatches.map(item => item.thumbnail).filter(Boolean),
      tracks: recentMatches.length > 0 ? recentMatches : normalizedHistory.value.slice(0, 4)
    }
  ].filter(group => group.tracks.length > 0)
})

const favList = computed(() => {
  try {
    return normalizeTrackList(favStore.favoriteSongs)
  } catch (e) { return [] }
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
})

const activeTab = ref('All')
const tabs = ['All', 'Hindi', 'Telugu', 'Tamil', 'Punjabi', 'Bollywood', 'Devotional']

const imageThumbs = {
  concert: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  guitar: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
  stage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80',
  crowd: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
  dj: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  record: 'https://images.unsplash.com/photo-1539628399213-d6489e6730ab?auto=format&fit=crop&w=900&q=80',
  mic: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
}

const curatedCategories = [
  { id: 'hindi-songs', name: 'Hindi Hits', description: 'Popular Hindi music', query: 'hindi songs 2024', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', tag: 'Hindi', thumbnail: imageThumbs.guitar },
  { id: 'telugu-songs', name: 'Telugu Beats', description: 'Latest Telugu hits', query: 'telugu songs 2024', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', tag: 'Telugu', thumbnail: imageThumbs.stage },
  { id: 'indian-songs', name: 'Indian Vibes', description: 'Best of Indian music', query: 'indian songs popular', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)', tag: 'Hindi', thumbnail: imageThumbs.concert },
  { id: 'love-songs', name: 'Love Songs', description: 'Romantic melodies', query: 'love songs romantic', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', tag: 'Hindi', thumbnail: imageThumbs.headphones },
  { id: 'tamil-songs', name: 'Tamil Waves', description: 'Tamil music collection', query: 'tamil songs 2024', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', tag: 'Tamil', thumbnail: imageThumbs.crowd },
  { id: 'punjabi-songs', name: 'Punjabi Fire', description: 'Energetic Punjabi beats', query: 'punjabi songs 2024', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', tag: 'Punjabi', thumbnail: imageThumbs.dj },
  { id: 'bollywood-hits', name: 'Bollywood', description: 'Top Bollywood tracks', query: 'bollywood songs 2024', gradient: 'linear-gradient(135deg, #c2410c, #b91c1c)', tag: 'Bollywood', thumbnail: imageThumbs.mic },
  { id: 'devotional', name: 'Devotional', description: 'Spiritual & devotional', query: 'devotional songs indian', gradient: 'linear-gradient(135deg, #fcd34d, #f97316)', tag: 'Devotional', thumbnail: imageThumbs.record },
  { id: 'party-songs', name: 'Party Mix', description: 'Dance & party hits', query: 'party songs hindi 2024', gradient: 'linear-gradient(135deg, #f97316, #fbbf24)', tag: 'Hindi', thumbnail: imageThumbs.stage },
  { id: 'sad-songs', name: 'Sad Songs', description: 'Emotional tracks', query: 'sad songs hindi', gradient: 'linear-gradient(135deg, #ea580c, #78350f)', tag: 'Hindi', thumbnail: imageThumbs.record },
]

const freshPicks = [
  { id: 'fresh-songs', name: 'Fresh Releases', description: 'New music across languages', query: 'new songs 2024', gradient: 'linear-gradient(135deg, #ff6b35, #f97316)', thumbnail: imageThumbs.concert },
  { id: 'night-drive', name: 'Night Drive', description: 'Smooth music for late rides', query: 'night drive songs', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', thumbnail: imageThumbs.headphones },
  { id: 'acoustic-session', name: 'Acoustic Session', description: 'Warm unplugged takes', query: 'acoustic songs', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', thumbnail: imageThumbs.guitar },
  { id: 'retro-grooves', name: 'Retro Grooves', description: 'Classic sounds with style', query: 'retro hindi songs', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', thumbnail: imageThumbs.record },
  { id: 'travel-vibes', name: 'Travel Vibes', description: 'Open-road energy', query: 'travel songs', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)', thumbnail: imageThumbs.crowd },
]

const filteredCategories = computed(() => {
  if (activeTab.value === 'All') return curatedCategories
  return curatedCategories.filter(c => c.tag === activeTab.value)
})

const bestTracks = ref([
  { id: 'top-50', name: 'Top 50 India', description: 'Most streamed', query: 'top 50 india songs', gradient: 'linear-gradient(135deg, #f97316, #b91c1c)', thumbnail: null },
  { id: 'trending', name: 'Trending Now', description: 'What\'s hot', query: 'trending songs india 2024', gradient: 'linear-gradient(135deg, #fbbf24, #ea580c)', thumbnail: null },
  { id: 'new-releases', name: 'New Releases', description: 'Fresh music', query: 'new songs 2024 hindi', gradient: 'linear-gradient(135deg, #f59e0b, #dc2626)', thumbnail: null },
  { id: 'old-classics', name: 'Classics', description: 'Timeless hits', query: 'classic hindi songs', gradient: 'linear-gradient(135deg, #c2410c, #78350f)', thumbnail: null },
  { id: 'workout', name: 'Workout', description: 'High energy', query: 'workout songs hindi', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', thumbnail: null },
  { id: 'viral-hits', name: 'Viral Hits', description: 'Internet favorites', query: 'viral songs 2024', gradient: 'linear-gradient(135deg, #ef4444, #f97316)', thumbnail: null },
  { id: 'indie-gems', name: 'Indie Gems', description: 'Independent artists', query: 'indie songs indian', gradient: 'linear-gradient(135deg, #10b981, #059669)', thumbnail: null },
  { id: 'sufi-soul', name: 'Sufi Soul', description: 'Spiritual melodies', query: 'sufi songs', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', thumbnail: null },
])

const artists = ref([
  { id: 'arijit', name: 'Arijit Singh', query: 'arijit singh songs', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', thumbnail: null },
  { id: 'shreya', name: 'Shreya Ghoshal', query: 'shreya ghoshal songs', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', thumbnail: null },
  { id: 'atif', name: 'Atif Aslam', query: 'atif aslam songs', gradient: 'linear-gradient(135deg, #fb923c, #dc2626)', thumbnail: null },
  { id: 'neha', name: 'Neha Kakkar', query: 'neha kakkar songs', gradient: 'linear-gradient(135deg, #fbbf24, #ea580c)', thumbnail: null },
  { id: 'armaan', name: 'Armaan Malik', query: 'armaan malik songs', gradient: 'linear-gradient(135deg, #c2410c, #f97316)', thumbnail: null },
  { id: 'jubin', name: 'Jubin Nautiyal', query: 'jubin nautiyal songs', gradient: 'linear-gradient(135deg, #f97316, #78350f)', thumbnail: null },
  { id: 'sid-sriram', name: 'Sid Sriram', query: 'sid sriram songs', gradient: 'linear-gradient(135deg, #fcd34d, #f59e0b)', thumbnail: null },
  { id: 'anirudh', name: 'Anirudh', query: 'anirudh songs', gradient: 'linear-gradient(135deg, #ea580c, #b91c1c)', thumbnail: null },
  { id: 'badshah', name: 'Badshah', query: 'badshah songs', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', thumbnail: null },
  { id: 'sonu-nigam', name: 'Sonu Nigam', query: 'sonu nigam songs', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', thumbnail: null },
  { id: 'alka-yagnik', name: 'Alka Yagnik', query: 'alka yagnik songs', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', thumbnail: null },
  { id: 'kumar-sanu', name: 'Kumar Sanu', query: 'kumar sanu songs', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', thumbnail: null },
  { id: 'diljit', name: 'Diljit Dosanjh', query: 'diljit dosanjh songs', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', thumbnail: null },
  { id: 'ar-rahman', name: 'A.R. Rahman', query: 'ar rahman songs', gradient: 'linear-gradient(135deg, #10b981, #059669)', thumbnail: null },
  { id: 'vishal-shekhar', name: 'Vishal-Shekhar', query: 'vishal shekhar songs', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', thumbnail: null },
  { id: 'pritam', name: 'Pritam', query: 'pritam songs', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', thumbnail: null },
])

const playlistThumbs = [
  imageThumbs.concert,
  imageThumbs.guitar,
  imageThumbs.stage,
  imageThumbs.crowd,
  imageThumbs.dj,
  imageThumbs.record,
  imageThumbs.mic,
  imageThumbs.headphones
]

const grads = [
  'linear-gradient(135deg,#f97316,#ea580c)', 'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#fb923c,#ef4444)', 'linear-gradient(135deg,#fbbf24,#ea580c)',
  'linear-gradient(135deg,#c2410c,#dc2626)', 'linear-gradient(135deg,#fcd34d,#f59e0b)'
]
function getGrad(i) { return grads[i % grads.length] }

// Load thumbnails for categories
async function loadThumbnails() {
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    // Load thumbnails for bestTracks
    for (const track of bestTracks.value) {
      try {
        const result = await electron.innertube.search(track.query, { type: 'video' })
        if (result.success && result.data && result.data.length > 0) {
          const musicResults = filterMusicContent(result.data)
          if (musicResults.length > 0) {
            const firstResult = musicResults[0]
            track.thumbnail = firstResult.thumbnails?.[0]?.url || firstResult.thumbnail || null
          }
        }
      } catch (err) {
        console.warn(`Failed to load thumbnail for ${track.name}:`, err)
      }
    }
    
    // Load thumbnails for artists
    for (const artist of artists.value) {
      try {
        const result = await electron.innertube.search(artist.query, { type: 'video' })
        if (result.success && result.data && result.data.length > 0) {
          const musicResults = filterMusicContent(result.data)
          if (musicResults.length > 0) {
            const firstResult = musicResults[0]
            artist.thumbnail = firstResult.thumbnails?.[0]?.url || firstResult.thumbnail || null
          }
        }
      } catch (err) {
        console.warn(`Failed to load thumbnail for ${artist.name}:`, err)
      }
    }
    
    // Load thumbnails for freshPicks
    for (const pick of freshPicks) {
      try {
        const result = await electron.innertube.search(pick.query, { type: 'video' })
        if (result.success && result.data && result.data.length > 0) {
          const musicResults = filterMusicContent(result.data)
          if (musicResults.length > 0) {
            const firstResult = musicResults[0]
            pick.thumbnail = firstResult.thumbnails?.[0]?.url || firstResult.thumbnail || null
          }
        }
      } catch (err) {
        console.warn(`Failed to load thumbnail for ${pick.name}:`, err)
      }
    }
    
    // Load thumbnails for curatedCategories
    for (const category of curatedCategories) {
      try {
        const result = await electron.innertube.search(category.query, { type: 'video' })
        if (result.success && result.data && result.data.length > 0) {
          const musicResults = filterMusicContent(result.data)
          if (musicResults.length > 0) {
            const firstResult = musicResults[0]
            category.thumbnail = firstResult.thumbnails?.[0]?.url || firstResult.thumbnail || null
          }
        }
      } catch (err) {
        console.warn(`Failed to load thumbnail for ${category.name}:`, err)
      }
    }
  } catch (err) {
    console.error('Failed to load thumbnails:', err)
  }
}

onMounted(async () => {
  await Promise.all([
    library.loadSongs(), 
    library.loadHistory(), 
    library.loadPlaylists(), 
    favStore.loadFavorites(),
    loadThumbnails()
  ])
})

function handlePlay(track) { player.setQueue([track], 0); player.playTrack(track) }
function goToPlaylist(id) { router.push(`/playlist/${id}`) }
function searchCategory(c) { router.push(`/category/${c.id}`) }
function playGroup(group) {
  if (group.tracks?.length > 0) {
    handlePlay(group.tracks[0])
  }
}
</script>

<style scoped>
.home { max-width: 1200px; margin: 0 auto; }

/* Dashboard Header */
.page-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-title { font-size: 24px; font-weight: 800; color: var(--color-text); letter-spacing: -0.5px; }
.page-sub { font-size: 13px; color: var(--color-secondary); margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

.header-search-container {
  position: relative;
  min-width: 320px;
}

.header-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 14px;
  transition: all var(--transition-fast);
}

.header-search.focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.header-search-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.header-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 14px;
  padding: 10px 0;
}

.header-search-input::placeholder {
  color: var(--color-text-muted);
}

.search-clear-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.search-clear-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.search-clear-btn svg {
  width: 16px;
  height: 16px;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-dropdown::-webkit-scrollbar {
  width: 8px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.search-section {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.search-section:last-child {
  border-bottom: none;
}

.search-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.result-count {
  color: var(--color-primary);
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.clear-history-btn:hover {
  background: rgba(249, 115, 22, 0.1);
}

.search-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.search-item:hover {
  background: var(--color-surface-hover);
}

.search-item-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-item-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-history-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all var(--transition-fast);
}

.search-item:hover .remove-history-btn {
  opacity: 1;
}

.remove-history-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.remove-history-btn svg {
  width: 14px;
  height: 14px;
}

.search-result-item {
  width: 100%;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--color-surface-hover);
}

.result-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.result-thumb-empty {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(245, 158, 11, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.result-thumb-empty svg {
  width: 20px;
  height: 20px;
}

.result-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-artist {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-play-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.search-result-item:hover .result-play-icon {
  opacity: 1;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.search-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
  text-align: center;
}

.search-empty svg {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  opacity: 0.3;
}

.search-empty p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.view-all-btn {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin-top: 4px;
}

.view-all-btn:hover {
  background: rgba(249, 115, 22, 0.1);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.welcome-card { grid-column: 1 / -1; }

.dash-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.dash-card:hover { border-color: var(--glass-border-hover); box-shadow: var(--shadow-md); }

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.card-icon {
  width: 24px; height: 24px;
  color: var(--color-secondary); display: flex; align-items: center; justify-content: center;
}
.card-header h3 { font-size: 14px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }

/* Health Stats */
.health-stats { display: flex; gap: 32px; align-items: center; }
.health-score { display: flex; flex-direction: column; align-items: center; }
.score-circle {
  width: 120px; height: 120px; border-radius: 50%;
  border: 8px solid var(--color-secondary);
  border-left-color: var(--color-primary);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.score-val { font-size: 32px; font-weight: 800; color: var(--color-text); line-height: 1; }
.score-label { font-size: 10px; font-weight: 700; color: var(--color-text-muted); margin-top: 4px; letter-spacing: 1px; }

.health-bars { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.h-bar-row { display: flex; align-items: center; gap: 12px; }
.h-label { width: 80px; font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
.h-track { flex: 1; height: 6px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
.h-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
.h-val { width: 40px; font-size: 12px; font-weight: 700; color: var(--color-text); text-align: right; }

/* Action Grid */
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.action-btn {
  background: var(--color-background); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  cursor: pointer; transition: all 0.2s;
}
.action-btn:hover:not(:disabled) { border-color: var(--color-secondary); background: var(--color-surface-hover); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.a-icon {
  width: 40px; height: 40px; border-radius: 8px;
  background: rgba(99, 102, 241, 0.1); color: var(--color-secondary);
  display: flex; align-items: center; justify-content: center;
}
.a-icon svg { width: 20px; height: 20px; }
.action-btn span { font-size: 13px; font-weight: 600; color: var(--color-text); }

/* Activity List */
.activity-list { display: flex; flex-direction: column; gap: 16px; }
.activity-item { display: flex; align-items: center; gap: 12px; }
.act-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-secondary); }
.act-content { flex: 1; display: flex; flex-direction: column; overflow: hidden;}
.act-title { font-size: 13px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.act-desc { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act-time { font-size: 11px; font-weight: 600; color: var(--color-secondary); }
.empty-state { padding: 20px; text-align: center; color: var(--color-text-muted); font-size: 13px; }

/* Summary Blocks */
.summary-blocks {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
}
.summary-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 16px; position: relative;
  display: flex; flex-direction: column;
}
.sum-label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 8px; }
.sum-val { font-size: 24px; font-weight: 800; color: var(--color-text); display: flex; align-items: baseline; gap: 8px; }
.sum-sub { font-size: 11px; font-weight: 600; color: var(--color-secondary); text-transform: uppercase; }
.sum-icon {
  position: absolute; right: 16px; top: 16px; width: 32px; height: 32px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.sum-icon svg { width: 16px; height: 16px; }

/* Reset/Reuse old styles for standard lists */
.section { margin-bottom: 48px; animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.section-head h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: var(--color-text); flex: 1; }
.section-icon {
  width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  background: rgba(249,115,22,0.1); color: var(--color-primary); flex-shrink: 0;
}
.section-icon svg { width: 16px; height: 16px; }
.section-icon.fav { background: rgba(239,68,68,0.1); color: #ef4444; }
.section-icon.best { background: rgba(251,191,36,0.12); color: #f59e0b; }
.section-icon.listen { background: rgba(249,115,22,0.1); color: #f97316; }
.section-icon.artist { background: rgba(251,146,60,0.1); color: #fb923c; }
.section-icon.lib { background: rgba(249,115,22,0.08); color: var(--color-primary); }
.section-icon.recent { background: rgba(245,158,11,0.1); color: #f59e0b; }
.section-icon.now { background: rgba(249,115,22,0.12); color: #f97316; }
.section-icon.related { background: rgba(124,58,237,0.08); color: #7c3aed; }
.section-icon.fresh { background: rgba(16,185,129,0.12); color: #10b981; }
.section-icon.mood { background: rgba(99,102,241,0.12); color: #6366f1; }

.see-all {
  font-size: 12px; font-weight: 600; color: var(--color-primary); text-decoration: none;
  padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(249,115,22,0.2);
  transition: all 0.15s ease;
}
.see-all:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.35); }

/* Horizontal Scroll Row */
.scroll-row {
  display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px;
  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
}
.scroll-row::-webkit-scrollbar { height: 0; }

/* Big Cards */
.big-card {
  flex-shrink: 0; width: 200px; cursor: pointer;
  animation: scaleUp 0.35s ease both; scroll-snap-align: start;
}
@keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

.big-card-cover {
  width: 200px; height: 200px; border-radius: 14px; position: relative;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.cover-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.18) 100%);
}
.big-card-cover .cover-icon,
.big-card-cover .card-play {
  position: relative;
  z-index: 1;
}
.big-card:hover .big-card-cover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }

.cover-icon { width: 48px; height: 48px; color: rgba(255,255,255,0.8); filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25)); }

.card-play {
  position: absolute; bottom: 10px; right: 10px; width: 36px; height: 36px;
  background: rgba(255,255,255,0.95); border-radius: 50%; display: flex;
  align-items: center; justify-content: center; opacity: 0; transform: translateY(6px);
  transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.card-play svg { width: 16px; height: 16px; color: var(--color-primary); margin-left: 1px; }
.big-card:hover .card-play { opacity: 1; transform: translateY(0); }

.card-label { display: block; font-size: 14px; font-weight: 700; color: var(--color-text); margin-top: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-desc { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }

/* Artist Cards */
.artist-card { flex-shrink: 0; width: 110px; text-align: center; cursor: pointer; animation: scaleUp 0.35s ease both; }
.artist-avatar {
  width: 96px; height: 96px; border-radius: 50%; margin: 0 auto; display: flex;
  align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.artist-avatar svg { width: 36px; height: 36px; color: rgba(255,255,255,0.85); }
.artist-photo { width: 100%; height: 100%; object-fit: cover; }
.artist-card:hover .artist-avatar { transform: scale(1.06); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.artist-name { display: block; font-size: 13px; font-weight: 700; color: var(--color-text); margin-top: 12px; }

/* Track List */
.track-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid var(--color-border);
}

.track-list .track-card {
  margin: 0;
}

/* Spotlight */
.spotlight-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(249, 115, 22, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.spotlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.12);
}

.spotlight-thumb {
  width: 112px;
  height: 112px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: var(--shadow-md);
}

.spotlight-thumb-empty {
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.spotlight-thumb-empty svg {
  width: 36px;
  height: 36px;
}

.spotlight-copy {
  min-width: 0;
}

.spotlight-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.spotlight-copy h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  color: var(--color-text);
}

.spotlight-copy p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.spotlight-action {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--color-primary);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.28);
}

.spotlight-action svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
}

/* Related groups */
.group-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.group-card {
  text-align: left;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface-elevated);
  border-radius: 18px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.18);
  box-shadow: var(--shadow-md);
}

.group-thumbs {
  width: 84px;
  height: 56px;
  position: relative;
}

.group-thumb {
  position: absolute;
  top: calc(var(--thumb-index, 0) * 4px);
  left: calc(var(--thumb-index, 0) * 14px);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  border: 2px solid var(--color-surface-elevated);
}

.group-thumb-empty {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(245, 158, 11, 0.18));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.group-thumb-empty svg {
  width: 18px;
  height: 18px;
}

.group-copy {
  min-width: 0;
}

.group-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-desc {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.group-card, .spotlight-card {
  font: inherit;
}

.group-card,
.spotlight-card {
  -webkit-appearance: none;
  appearance: none;
}

.group-card:focus-visible,
.spotlight-card:focus-visible {
  outline: 2px solid rgba(249, 115, 22, 0.35);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .spotlight-card {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .spotlight-action {
    grid-column: 1 / -1;
    justify-self: end;
  }
}

@media (max-width: 640px) {
  .spotlight-card {
    grid-template-columns: 88px minmax(0, 1fr);
    padding: 12px;
    border-radius: 18px;
  }

  .spotlight-thumb {
    width: 88px;
    height: 88px;
    border-radius: 14px;
  }

  .spotlight-copy h3 {
    font-size: 18px;
  }

  .group-card {
    grid-template-columns: auto 1fr;
  }

  .group-count {
    grid-column: 2;
    justify-self: start;
  }
}

/* Mood Panel */
.mood-panel {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.mood-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.mood-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.mood-panel-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.mood-panel-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.mood-panel-close:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.mood-panel-close svg {
  width: 18px;
  height: 18px;
}

.mood-panel-tracks {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 360px;
  overflow-y: auto;
}

.mood-panel-tracks::-webkit-scrollbar {
  width: 8px;
}

.mood-panel-tracks::-webkit-scrollbar-track {
  background: transparent;
}

.mood-panel-tracks::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.mood-emoji {
  font-size: 48px;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon {
  width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(249,115,22,0.25);
}
.empty-icon svg { width: 28px; height: 28px; color: white; }
.empty-state h3 { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.empty-state p { font-size: 13px; color: var(--color-text-muted); }

.bottom-spacer { height: 20px; }

@media (max-width: 768px) {
  .big-card-cover { width: 160px; height: 160px; }
  .big-card { width: 160px; }
  .artist-avatar { width: 72px; height: 72px; }
  .artist-card { width: 88px; }
}
</style>
