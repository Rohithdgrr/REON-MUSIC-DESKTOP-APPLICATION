<template>
  <div class="category-view">
    <div class="category-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <div class="category-info">
        <div class="category-badge" :style="{ background: categoryGradient }">
          <svg class="category-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div>
          <h1 class="category-title">{{ categoryName }}</h1>
          <p class="category-description">{{ categoryDescription }}</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading && results.length === 0" class="loading-state">
      <div class="spinner"></div>
      <span>Loading songs...</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="results.length > 0" class="results">
      <div class="results-header">
        <h2 class="section-title">{{ results.length }} songs</h2>
        <button class="play-all-btn" @click="playAll">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play All
        </button>
      </div>
      
      <div class="results-list">
        <TrackCard
          v-for="track in results"
          :key="track.videoId"
          :track="track"
          @play="handlePlay"
        />
      </div>

      <div v-if="hasMore" class="load-more-section">
        <button 
          class="load-more-btn" 
          @click="loadMore"
          :disabled="isLoadingMore"
        >
          <span v-if="isLoadingMore">
            <div class="btn-spinner"></div>
            Loading...
          </span>
          <span v-else>Show More</span>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      No songs found for this category
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import TrackCard from '../components/TrackCard.vue'
import { filterMusicContent } from '../utils/contentFilter.js'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()

const categoryName = ref('')
const categoryDescription = ref('')
const categoryGradient = ref('')
const categoryQuery = ref('')
const results = ref([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref(null)
const hasMore = ref(true)
const page = ref(1)

const categories = {
  'hindi-songs': {
    name: 'Hindi Songs',
    description: 'Popular Hindi music',
    queries: [
      'hindi songs 2024',
      'latest hindi songs',
      'hindi romantic songs',
      'hindi party songs',
      'hindi sad songs'
    ],
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
  },
  'telugu-songs': {
    name: 'Telugu Songs',
    description: 'Latest Telugu hits',
    queries: [
      'telugu songs 2024',
      'latest telugu songs',
      'telugu romantic songs',
      'telugu mass songs',
      'telugu melody songs'
    ],
    gradient: 'linear-gradient(135deg, #ff8c42 0%, #ff6b6b 100%)'
  },
  'indian-songs': {
    name: 'Indian Songs',
    description: 'Best of Indian music',
    queries: [
      'indian songs popular',
      'best indian songs',
      'indian classical songs',
      'indian folk songs',
      'indian pop songs'
    ],
    gradient: 'linear-gradient(135deg, #ffa726 0%, #ff7043 100%)'
  },
  'love-songs': {
    name: 'Love Songs',
    description: 'Romantic melodies',
    queries: [
      'love songs romantic',
      'romantic songs hindi',
      'love songs english',
      'romantic duets',
      'love songs tamil'
    ],
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ff8a65 100%)'
  },
  'tamil-songs': {
    name: 'Tamil Songs',
    description: 'Tamil music collection',
    queries: [
      'tamil songs 2024',
      'latest tamil songs',
      'tamil romantic songs',
      'tamil kuthu songs',
      'tamil melody songs'
    ],
    gradient: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)'
  },
  'punjabi-songs': {
    name: 'Punjabi Songs',
    description: 'Energetic Punjabi beats',
    queries: [
      'punjabi songs 2024',
      'latest punjabi songs',
      'punjabi party songs',
      'punjabi romantic songs',
      'punjabi bhangra songs'
    ],
    gradient: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)'
  },
  'bollywood-hits': {
    name: 'Bollywood Hits',
    description: 'Top Bollywood tracks',
    queries: [
      'bollywood songs 2024',
      'latest bollywood songs',
      'bollywood party songs',
      'bollywood romantic songs',
      'bollywood dance songs'
    ],
    gradient: 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)'
  },
  'devotional': {
    name: 'Devotional',
    description: 'Spiritual & devotional',
    queries: [
      'devotional songs indian',
      'bhajans',
      'devotional songs hindi',
      'devotional songs telugu',
      'devotional songs tamil'
    ],
    gradient: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)'
  },
  'fresh-songs': {
    name: 'Fresh Releases',
    description: 'New music across languages',
    queries: [
      'new songs 2024',
      'latest songs 2024',
      'fresh releases music',
      'new hindi songs',
      'new indian songs'
    ],
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)'
  },
  'night-drive': {
    name: 'Night Drive',
    description: 'Smooth music for late rides',
    queries: [
      'night drive songs',
      'late night songs',
      'road trip songs',
      'calm drive music',
      'evening songs'
    ],
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
  },
  'acoustic-session': {
    name: 'Acoustic Session',
    description: 'Warm unplugged takes',
    queries: [
      'acoustic songs',
      'unplugged songs',
      'live acoustic music',
      'acoustic hindi songs',
      'acoustic love songs'
    ],
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)'
  },
  'retro-grooves': {
    name: 'Retro Grooves',
    description: 'Classic sounds with style',
    queries: [
      'retro hindi songs',
      'old hindi songs',
      'classic bollywood songs',
      'retro songs 90s',
      'golden era songs'
    ],
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
  },
  'travel-vibes': {
    name: 'Travel Vibes',
    description: 'Open-road energy',
    queries: [
      'travel songs',
      'road trip songs',
      'journey songs',
      'trip playlist',
      'songs for travel'
    ],
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
  },
  'chill-vibes': {
    name: 'Chill Vibes',
    description: 'Easy listening and calm beats',
    queries: [
      'chill songs',
      'relaxing songs',
      'lofi music',
      'calm songs',
      'soft playlist'
    ],
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  'romantic-flow': {
    name: 'Romantic Flow',
    description: 'Soft songs with a slow burn',
    queries: [
      'romantic songs',
      'love songs',
      'romantic hindi songs',
      'romantic melodies',
      'slow love songs'
    ],
    gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
  },
  'party-anthem': {
    name: 'Party Anthem',
    description: 'Big hooks and loud energy',
    queries: [
      'party songs',
      'dance songs',
      'party hits',
      'dance playlist',
      'club songs'
    ],
    gradient: 'linear-gradient(135deg, #ff512f 0%, #f09819 100%)'
  },
  'workout-energy': {
    name: 'Workout Energy',
    description: 'Fast tracks to keep pace',
    queries: [
      'workout songs',
      'gym music',
      'exercise songs',
      'high energy songs',
      'running playlist'
    ],
    gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)'
  },
  'devotional-calm': {
    name: 'Devotional Calm',
    description: 'Quiet and centered mood',
    queries: [
      'devotional songs',
      'calm devotional music',
      'bhajans',
      'meditation music',
      'spiritual songs'
    ],
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
  }
}

onMounted(async () => {
  const categoryId = route.params.id
  const category = categories[categoryId]
  
  if (category) {
    categoryName.value = category.name
    categoryDescription.value = category.description
    categoryGradient.value = category.gradient
    categoryQuery.value = category.queries[0]
    
    await loadSongs()
  } else {
    error.value = 'Category not found'
  }
})

async function loadSongs() {
  if (isLoading.value || isLoadingMore.value) return
  
  const isFirstLoad = results.value.length === 0
  
  if (isFirstLoad) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }
  
  error.value = null

  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const categoryId = route.params.id
    const category = categories[categoryId]
    
    // Use different queries for variety
    const queryIndex = (page.value - 1) % category.queries.length
    const query = category.queries[queryIndex]
    
    const result = await electron.innertube.search(query)
    
    if (result.success) {
      // Filter to music-only content
      const musicResults = filterMusicContent(result.data || [])
      // Filter out duplicates
      const newResults = musicResults.filter(track => 
        !results.value.some(existing => existing.videoId === track.videoId)
      )
      
      results.value = [...results.value, ...newResults]
      
      // Check if we got results
      if (newResults.length === 0) {
        hasMore.value = false
      }
    } else {
      error.value = result.error || 'Failed to load songs'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load songs'
    console.error('Load songs error:', err)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

async function loadMore() {
  page.value++
  await loadSongs()
}

function handlePlay(track) {
  player.setQueue(results.value, results.value.findIndex(t => t.videoId === track.videoId))
  player.playTrack(track)
}

function playAll() {
  if (results.value.length > 0) {
    player.setQueue(results.value, 0)
    player.playTrack(results.value[0])
  }
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.category-view {
  max-width: 1200px;
  margin: 0 auto;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
}

.back-btn {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn svg {
  width: 20px;
  height: 20px;
  color: var(--color-text);
}

.back-btn:hover {
  background: var(--color-surface-hover);
  transform: scale(1.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-badge {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.category-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.category-description {
  font-size: 16px;
  color: var(--color-text-muted);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.play-all-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.play-all-btn svg {
  width: 16px;
  height: 16px;
}

.play-all-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid var(--color-border);
}

.results-list .track-card {
  margin: 0;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 32px;
}

.load-more-btn {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 12px 32px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  transform: translateY(-2px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-text);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
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

@media (max-width: 768px) {
  .category-header {
    gap: 16px;
  }
  
  .category-badge {
    width: 60px;
    height: 60px;
  }
  
  .category-icon {
    width: 30px;
    height: 30px;
  }
  
  .category-title {
    font-size: 24px;
  }
  
  .category-description {
    font-size: 14px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
