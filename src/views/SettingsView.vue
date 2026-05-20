<template>
  <div class="settings-view">
    <div class="view-header">
      <div class="header-top-row">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div>
          <h1>Settings</h1>
          <p class="subtitle">Configure your Music Reon experience</p>
        </div>
      </div>
    </div>

    <div class="settings-content">
      <!-- Playback Settings -->
      <section class="settings-section">
        <h2>Playback</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Crossfade Duration</div>
            <div class="setting-description">Smooth transitions between songs</div>
          </div>
          <select v-model="settings.crossfadeDuration" class="setting-select">
            <option :value="0">Off</option>
            <option :value="2">2 seconds</option>
            <option :value="3">3 seconds</option>
            <option :value="5">5 seconds</option>
            <option :value="10">10 seconds</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Gapless Playback</div>
            <div class="setting-description">No silence between tracks</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.gaplessPlayback" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Auto-play Next</div>
            <div class="setting-description">Automatically play next song in queue</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.autoplayNext" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- Audio Settings -->
      <section class="settings-section">
        <h2>Audio</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Audio Quality</div>
            <div class="setting-description">Preferred audio format</div>
          </div>
          <select v-model="settings.audioQuality" class="setting-select">
            <option value="high">High (Opus/WebM)</option>
            <option value="medium">Medium (AAC)</option>
            <option value="low">Low (MP3)</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Volume Normalization</div>
            <div class="setting-description">Consistent volume across songs</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.volumeNormalization" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Playback Speed</div>
            <div class="setting-description">Adjust playback tempo (0.5x - 2x)</div>
          </div>
          <div class="setting-range">
            <span class="range-value">{{ settings.playbackSpeed }}x</span>
            <input type="range" min="0.5" max="2" step="0.05" v-model.number="settings.playbackSpeed" class="range-slider" />
          </div>
        </div>
      </section>

      <!-- Appearance Settings -->
      <section class="settings-section">
        <h2>Appearance</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Theme</div>
            <div class="setting-description">Choose your preferred theme</div>
          </div>
          <select v-model="settings.theme" class="setting-select">
            <option value="light">Light Orange</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Animations</div>
            <div class="setting-description">Enable smooth animations</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.animations" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- Storage Settings -->
      <section class="settings-section">
        <h2>Storage</h2>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Cache Duration</div>
            <div class="setting-description">How long to cache stream URLs</div>
          </div>
          <select v-model="settings.cacheDuration" class="setting-select">
            <option :value="1">1 hour</option>
            <option :value="3">3 hours</option>
            <option :value="5">5 hours</option>
            <option :value="12">12 hours</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Clear Cache</div>
            <div class="setting-description">Remove cached stream URLs</div>
          </div>
          <button @click="clearCache" class="action-btn">Clear Cache</button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">Clear History</div>
            <div class="setting-description">Remove all listening history</div>
          </div>
          <button @click="clearHistory" class="action-btn danger">Clear History</button>
        </div>
      </section>

      <!-- About Section -->
      <section class="settings-section">
        <h2>About</h2>
        <div class="about-content">
          <div class="app-info">
            <div class="app-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="app-details">
              <h3>Music Reon</h3>
              <p>Version 1.0.0</p>
              <p class="app-description">A modern music streaming application</p>
            </div>
          </div>
          
          <div class="about-links">
            <button @click="openKeyboardShortcuts" class="link-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
              </svg>
              Keyboard Shortcuts
            </button>
            <button @click="exportData" class="link-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
              Export Data
            </button>
            <button @click="importData" class="link-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6-.67l-2.59 2.58L9 12.5l5-5 5 5-1.41 1.41L13 11.33V21h-2z"/>
              </svg>
              Import Data
            </button>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="settings-actions">
        <button @click="saveSettings" class="save-btn">
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { useNotifications } from '../composables/useNotifications.js'

const router = useRouter()
const { currentTheme, setTheme } = useTheme()
const playerStore = usePlayerStore()
const library = useLibraryStore()
const { showNotification } = useNotifications()

const settings = ref({
  crossfadeDuration: 3,
  gaplessPlayback: false,
  autoplayNext: true,
  audioQuality: 'high',
  volumeNormalization: false,
  playbackSpeed: 1.0,
  theme: 'light',
  animations: true,
  cacheDuration: 5
})

onMounted(() => {
  loadSettings()
  settings.value.theme = currentTheme.value
})

// Apply audio settings in real-time
watch(() => settings.value.playbackSpeed, (speed) => {
  playerStore.applyPlaybackSpeed(speed)
})

watch(() => settings.value.crossfadeDuration, (dur) => {
  playerStore.applyCrossfade(dur > 0, dur * 1000)
})

function loadSettings() {
  const saved = localStorage.getItem('musicReonSettings')
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) }
  }
}

function saveSettings() {
  localStorage.setItem('musicReonSettings', JSON.stringify(settings.value))
  setTheme(settings.value.theme)
  showNotification({ title: 'Settings saved', type: 'success' })
}

function clearCache() {
  if (confirm('Clear all cached data?')) {
    showNotification({ title: 'Cache cleared', type: 'success' })
  }
}

async function clearHistory() {
  if (confirm('Clear all listening history? This cannot be undone.')) {
    try {
      const electron = window.electron
      if (electron) {
        await electron.sqlite.clearHistory()
        showNotification({ title: 'History cleared', type: 'success' })
      }
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }
}

function goBack() {
  router.back()
}

function openKeyboardShortcuts() {
  router.push('/shortcuts')
}

async function exportData() {
  try {
    const electron = window.electron
    if (!electron) return
    
    const [songs, playlists, favorites, history] = await Promise.all([
      electron.sqlite.getAllSongs(),
      electron.sqlite.getPlaylists(),
      electron.sqlite.getFavorites(),
      electron.sqlite.getHistory()
    ])
    
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      songs: songs.data || [],
      playlists: playlists.data || [],
      favorites: favorites.data || [],
      history: history.data || []
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `music-reon-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification({ title: 'Data exported successfully', type: 'success' })
  } catch (err) {
    console.error('Export failed:', err)
    showNotification({ title: 'Export failed', message: err.message, type: 'error' })
  }
}

async function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.songs && !data.playlists) {
        throw new Error('Invalid backup file: missing songs or playlists')
      }
      
      const electron = window.electron
      if (!electron) {
        showNotification({ title: 'Import failed', message: 'Electron API not available', type: 'error' })
        return
      }
      
      let imported = 0
      
      // Import songs
      if (data.songs?.length) {
        for (const song of data.songs) {
          await electron.sqlite.addSong({
            videoId: song.video_id || song.videoId,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail_url || song.thumbnail || '',
            duration: song.duration_seconds || song.duration || 0
          })
          imported++
        }
      }
      
      // Import playlists
      if (data.playlists?.length) {
        for (const pl of data.playlists) {
          await electron.sqlite.createPlaylist(pl.name)
          imported++
        }
      }
      
      // Import favorites
      if (data.favorites?.length) {
        for (const fav of data.favorites) {
          await electron.sqlite.addFavorite(fav.song_id || fav.id)
          imported++
        }
      }
      
      await library.loadSongs()
      await library.loadPlaylists()
      
      showNotification({
        title: 'Import complete',
        message: `${imported} items imported`,
        type: 'success'
      })
    } catch (err) {
      showNotification({ title: 'Import failed', message: err.message, type: 'error' })
    }
  }
  input.click()
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: var(--space-xl);
}

.view-header h1 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.settings-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.settings-section h2 {
  margin: 0 0 var(--space-lg) 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.setting-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.setting-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.action-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.action-btn.danger {
  border-color: var(--color-error);
  color: var(--color-error);
}

.action-btn.danger:hover {
  background: rgba(244, 67, 54, 0.1);
}

.setting-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-mono);
  min-width: 36px;
  text-align: center;
}

.range-slider {
  -webkit-appearance: none;
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  outline: none;
  transition: all var(--transition-fast);
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.app-info {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.app-details h3 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.app-details p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.app-description {
  margin-top: var(--space-xs) !important;
}

.about-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.link-btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.link-btn svg {
  width: 18px;
  height: 18px;
}

.link-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-lg);
}

.save-btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.save-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .setting-select,
  .action-btn {
    width: 100%;
  }
}
</style>
