import { ref } from 'vue'

const error = ref(null)
let timer = null

export function useErrorBoundary() {
  function captureError(err, vm, info) {
    if (err?.suppressed) return
    console.error('[ErrorBoundary]', err?.message || err, info ? `(${info})` : '')
    error.value = { message: err?.message || String(err), timestamp: Date.now() }
    clearTimeout(timer)
    timer = setTimeout(() => { error.value = null }, 30000)
  }

  function dismissError() {
    error.value = null
    clearTimeout(timer)
  }

  return { error, captureError, dismissError }
}
