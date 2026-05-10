import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '../../../src/stores/search.js'

describe('Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock Electron IPC
    global.window = {
      electron: {
        innertube: {
          search: vi.fn()
        }
      }
    }
  })

  it('has empty initial state', () => {
    const store = useSearchStore()
    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('performs search and stores results', async () => {
    const mockResults = [
      { videoId: 'abc123', title: 'Test Song', artist: 'Test Artist', thumbnail: '', duration: 180 }
    ]
    window.electron.innertube.search.mockResolvedValue({
      success: true,
      data: mockResults
    })

    const store = useSearchStore()
    await store.performSearch('test query')

    expect(window.electron.innertube.search).toHaveBeenCalledWith('test query')
    expect(store.query).toBe('test query')
    expect(store.results).toEqual(mockResults)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles search errors gracefully', async () => {
    window.electron.innertube.search.mockResolvedValue({
      success: false,
      error: 'Network error'
    })

    const store = useSearchStore()
    await store.performSearch('bad query')

    expect(store.error).toBe('Network error')
    expect(store.results).toEqual([])
    expect(store.isLoading).toBe(false)
  })

  it('clears results and query on clearResults', () => {
    const store = useSearchStore()
    store.query = 'test'
    store.results = [{ videoId: '1' }]
    store.error = 'error'

    store.clearResults()

    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.error).toBeNull()
  })

  it('does not search with empty query', async () => {
    const store = useSearchStore()
    await store.performSearch('')

    expect(window.electron.innertube.search).not.toHaveBeenCalled()
    expect(store.results).toEqual([])
  })
})
