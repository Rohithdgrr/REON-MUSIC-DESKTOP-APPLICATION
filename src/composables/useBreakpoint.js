import { ref, onMounted, onUnmounted, computed } from 'vue'

const BREAKPOINTS = {
  xs: 480,
  sm: 600,
  md: 768,
  lg: 900,
  xl: 1099,
  '2xl': 1400,
  '3xl': 1700
}

const STATE = {
  width: ref(typeof window === 'undefined' ? 1280 : window.innerWidth),
  height: ref(typeof window === 'undefined' ? 800 : window.innerHeight)
}

let initialized = false
let resizeHandler = null

function update() {
  if (typeof window === 'undefined') return
  STATE.width.value = window.innerWidth
  STATE.height.value = window.innerHeight
}

function ensureInit() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  resizeHandler = () => update()
  window.addEventListener('resize', resizeHandler, { passive: true })
}

function teardown() {
  if (!initialized || typeof window === 'undefined') return
  window.removeEventListener('resize', resizeHandler)
  initialized = false
  resizeHandler = null
}

function createMatchMediaQuery(name) {
  const bp = BREAKPOINTS[name]
  if (!bp) return ''
  if (name === 'xs') return `(max-width: ${BREAKPOINTS.sm - 1}px)`
  return `(min-width: ${bp}px)`
}

function isUp(name) {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= (BREAKPOINTS[name] || 0)
}

function isDown(name) {
  if (typeof window === 'undefined') return false
  const nextKey = Object.keys(BREAKPOINTS).find(k => BREAKPOINTS[k] > BREAKPOINTS[name])
  const upper = nextKey ? BREAKPOINTS[nextKey] - 1 : Infinity
  return window.innerWidth <= upper
}

export function useBreakpoint() {
  ensureInit()

  const xs = computed(() => STATE.width.value < BREAKPOINTS.sm)
  const sm = computed(() => STATE.width.value >= BREAKPOINTS.sm && STATE.width.value < BREAKPOINTS.md)
  const md = computed(() => STATE.width.value >= BREAKPOINTS.md && STATE.width.value < BREAKPOINTS.lg)
  const lg = computed(() => STATE.width.value >= BREAKPOINTS.lg && STATE.width.value < BREAKPOINTS.xl)
  const xl = computed(() => STATE.width.value >= BREAKPOINTS.xl && STATE.width.value < BREAKPOINTS['2xl'])
  const x2l = computed(() => STATE.width.value >= BREAKPOINTS['2xl'] && STATE.width.value < BREAKPOINTS['3xl'])
  const x3l = computed(() => STATE.width.value >= BREAKPOINTS['3xl'])

  const isMobile = computed(() => STATE.width.value < BREAKPOINTS.md)
  const isTablet = computed(() => STATE.width.value >= BREAKPOINTS.md && STATE.width.value < BREAKPOINTS.lg)
  const isDesktop = computed(() => STATE.width.value >= BREAKPOINTS.lg)
  const isNarrow = computed(() => STATE.width.value < BREAKPOINTS.sm)
  const isUltrawide = computed(() => STATE.width.value >= BREAKPOINTS['3xl'])
  const isLarge = computed(() => STATE.width.value >= BREAKPOINTS['2xl'])

  const width = computed(() => STATE.width.value)
  const height = computed(() => STATE.height.value)

  const up = (name) => computed(() => isUp(name))
  const down = (name) => computed(() => isDown(name))
  const between = (lo, hi) => computed(() => STATE.width.value >= BREAKPOINTS[lo] && STATE.width.value < BREAKPOINTS[hi])
  const mq = createMatchMediaQuery

  return {
    width,
    height,
    xs, sm, md, lg, xl, x2l, x3l,
    isMobile, isTablet, isDesktop, isNarrow, isUltrawide, isLarge,
    up, down, between,
    mq
  }
}

export function useBreakpointGlobal() {
  return { width: STATE.width, height: STATE.height, teardown }
}

export { BREAKPOINTS }
