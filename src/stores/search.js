import { defineStore } from 'pinia'
import { ref } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { filterMusicContent } from '../utils/contentFilter.js'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const filterType = ref('music') // 'music' | 'all'

  async function performSearch(searchQuery) {
    if (!searchQuery?.trim()) {
      results.value = []
      return
    }

    isLoading.value = true
    error.value = null
    query.value = searchQuery

    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.innertube.search(searchQuery.trim())
      if (result.success) {
        let filtered = result.data
        if (filterType.value === 'music') {
          filtered = filterMusicContent(filtered)
        }
        results.value = filtered
      } else {
        error.value = result.error || 'Search failed'
        results.value = []
      }
    } catch (err) {
      error.value = err.message || 'Search failed'
      results.value = []
      console.error('Search error:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setFilterType(type) {
    filterType.value = type
  }

  function clearResults() {
    results.value = []
    query.value = ''
    error.value = null
  }

  return {
    query,
    results,
    isLoading,
    error,
    filterType,
    performSearch,
    setFilterType,
    clearResults
  }
})
