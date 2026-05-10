import { defineStore } from 'pinia'
import { ref } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function performSearch(searchQuery) {
    if (!searchQuery?.trim()) {
      results.value = []
      return
    }

    isLoading.value = true
    error.value = null
    query.value = searchQuery

    try {
      // Wait for electron API to be ready
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.innertube.search(searchQuery.trim())
      if (result.success) {
        results.value = result.data
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
    performSearch,
    clearResults
  }
})
