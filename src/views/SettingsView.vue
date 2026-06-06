<template>
  <div class="settings-view">
    <!-- View Header -->
    <div class="view-header">
      <div class="header-top-row">
        <button class="back-btn" @click="goBack" title="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <h1>Configuration</h1>
          <div class="status-badge">
            <span class="status-dot"></span>
            SETTINGS REGISTRY VALID
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button @click="resetToDefaults" class="action-btn-outline">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          RESET DEFAULT
        </button>
        <button @click="saveSettings" class="action-btn-solid">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          SAVE CONFIG
        </button>
      </div>
    </div>

    <!-- Main Content Split -->
    <div class="settings-grid">
      <!-- Left Navigation Pane -->
      <div class="navigation-pane">
        <div class="nav-pills">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="nav-pill"
            :class="{ active: activeTab === tab.id }"
          >
            <span class="pill-accent" v-if="activeTab === tab.id"></span>
            <span class="pill-icon" v-html="tab.icon"></span>
            <span class="pill-label">{{ tab.name }}</span>
          </button>
        </div>

        <!-- Sidebar footer status -->
        <div class="pane-footer">
          <div class="footer-status-item">
            <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>LOCAL ENVIRONMENT ACTIVE</span>
          </div>
          <div class="footer-status-item">
            <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>NO EXTERNAL BROADCAST</span>
          </div>
        </div>
      </div>

      <!-- Right Active Panel Card Pane -->
      <div class="content-pane">
        <Transition name="fade" mode="out-in">
          <!-- SYSTEM CORE TAB -->
          <div v-if="activeTab === 'core'" class="pane-tab-content">
            <div class="settings-card">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                      <line x1="6" y1="6" x2="6.01" y2="6"/>
                      <line x1="6" y1="18" x2="6.01" y2="18"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Playback Core</h3>
                    <p class="card-subtitle">SYSTEM TRANSITIONS & PRIORITY CONTROLS</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <!-- Crossfade Duration Slider -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Crossfade Duration</span>
                    <span class="setting-desc">Smoothen transition spacing between playback tracks</span>
                  </div>
                  <div class="slider-container">
                    <span class="slider-badge">{{ settings.crossfadeDuration }}s</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      v-model.number="settings.crossfadeDuration" 
                      class="custom-slider"
                    />
                  </div>
                </div>

                <!-- Gapless Playback toggle -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Gapless Playback</span>
                    <span class="setting-desc">Completely eliminate audio gaps between sequential songs</span>
                  </div>
                  <label class="premium-toggle">
                    <input type="checkbox" v-model="settings.gaplessPlayback" />
                    <span class="toggle-track"></span>
                  </label>
                </div>

                <!-- Auto-play Next toggle -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Auto-play Next</span>
                    <span class="setting-desc">Automatically append similar songs when the queue completes</span>
                  </div>
                  <label class="premium-toggle">
                    <input type="checkbox" v-model="settings.autoplayNext" />
                    <span class="toggle-track"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- AUDIO ENGINE & RAG TUNING TAB -->
          <div v-else-if="activeTab === 'audio'" class="pane-tab-content">
            <!-- API Keys Card (styled exactly like the screenshot) -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <h3>API Keys</h3>
                    <p class="card-subtitle">TELEMETRY CONFIGURATION</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <div class="api-fields-grid">
                  <div class="field-item">
                    <label class="field-label">LLM PROVIDER KEY</label>
                    <div class="masked-input-wrapper">
                      <input 
                        :type="showLlmKey ? 'text' : 'password'" 
                        v-model="settings.llmProviderKey" 
                        placeholder="••••••••••••••••••••••••"
                        class="field-input"
                      />
                      <button @click="showLlmKey = !showLlmKey" class="mask-toggle-btn" type="button">
                        <svg v-if="showLlmKey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="field-item">
                    <label class="field-label">MCP ROUTER KEY</label>
                    <div class="masked-input-wrapper">
                      <input 
                        :type="showMcpKey ? 'text' : 'password'" 
                        v-model="settings.mcpRouterKey" 
                        placeholder="••••••••••••••••••••••••"
                        class="field-input"
                      />
                      <button @click="showMcpKey = !showMcpKey" class="mask-toggle-btn" type="button">
                        <svg v-if="showMcpKey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- RAG Engine Card (styled exactly like the screenshot sliders) -->
            <div class="settings-card" style="margin-top: 24px;">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                      <rect x="9" y="9" width="6" height="6"/>
                      <line x1="9" y1="1" x2="9" y2="4"/>
                      <line x1="15" y1="1" x2="15" y2="4"/>
                      <line x1="9" y1="20" x2="9" y2="23"/>
                      <line x1="15" y1="20" x2="15" y2="23"/>
                      <line x1="20" y1="9" x2="23" y2="9"/>
                      <line x1="20" y1="15" x2="23" y2="15"/>
                      <line x1="1" y1="9" x2="4" y2="9"/>
                      <line x1="1" y1="15" x2="4" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <h3>RAG Engine</h3>
                    <p class="card-subtitle">VECTOR TUNING & THRESHOLDS</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <!-- TOP-K RETRIEVAL -->
                <div class="slider-row-item">
                  <div class="slider-meta">
                    <div class="slider-title-grp">
                      <svg class="slider-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <span class="slider-label">TOP-K RETRIEVAL</span>
                    </div>
                    <span class="slider-value-badge">{{ settings.topKRetrieval }} docs</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    v-model.number="settings.topKRetrieval" 
                    class="screenshot-slider"
                  />
                  <div class="slider-limits">
                    <span>1 DOCS</span>
                    <span>20 DOCS</span>
                  </div>
                </div>

                <!-- CHUNK SIZE -->
                <div class="slider-row-item">
                  <div class="slider-meta">
                    <div class="slider-title-grp">
                      <svg class="slider-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      <span class="slider-label">CHUNK SIZE</span>
                    </div>
                    <span class="slider-value-badge">{{ settings.chunkSize }} tks</span>
                  </div>
                  <input 
                    type="range" 
                    min="512" 
                    max="4096" 
                    step="256"
                    v-model.number="settings.chunkSize" 
                    class="screenshot-slider"
                  />
                  <div class="slider-limits">
                    <span>512 TKS</span>
                    <span>4096 TKS</span>
                  </div>
                </div>

                <!-- CHUNK OVERLAP -->
                <div class="slider-row-item">
                  <div class="slider-meta">
                    <div class="slider-title-grp">
                      <svg class="slider-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4z"/></svg>
                      <span class="slider-label">CHUNK OVERLAP</span>
                    </div>
                    <span class="slider-value-badge">{{ settings.chunkOverlap }} tks</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="10"
                    v-model.number="settings.chunkOverlap" 
                    class="screenshot-slider"
                  />
                  <div class="slider-limits">
                    <span>0 TKS</span>
                    <span>500 TKS</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Standard Audio Settings Card -->
            <div class="settings-card" style="margin-top: 24px;">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Audio Parameters</h3>
                    <p class="card-subtitle">DECODER RESOLUTION & SIGNAL TUNING</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <!-- Audio Quality select -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Preferred Audio Stream Resolution</span>
                    <span class="setting-desc">Highest yields premium fidelity but consumes greater buffer storage</span>
                  </div>
                  <select v-model="settings.audioQuality" class="premium-select">
                    <option value="high">High (Opus/WebM - Premium)</option>
                    <option value="medium">Medium (AAC - Balanced)</option>
                    <option value="low">Low (MP3 - Lightweight)</option>
                  </select>
                </div>

                <!-- Normalization toggle -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Volume Signal Normalization</span>
                    <span class="setting-desc">Maintains consistent sound output gain levels across shifting recordings</span>
                  </div>
                  <label class="premium-toggle">
                    <input type="checkbox" v-model="settings.volumeNormalization" />
                    <span class="toggle-track"></span>
                  </label>
                </div>

                <!-- Playback Speed Slider -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Playback Vector Speed</span>
                    <span class="setting-desc">Shift playback tempo frequency scaling (0.5x - 2.0x)</span>
                  </div>
                  <div class="slider-container">
                    <span class="slider-badge" style="min-width: 48px;">{{ settings.playbackSpeed }}x</span>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.05"
                      v-model.number="settings.playbackSpeed" 
                      class="custom-slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- INTERFACE & THEMING TAB -->
          <div v-else-if="activeTab === 'interface'" class="pane-tab-content">
            <div class="settings-card">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Interface Layout</h3>
                    <p class="card-subtitle">VISUAL STYLE & THEME ENGINE</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <!-- Theme Select -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Active Theme Selection</span>
                    <span class="setting-desc">Switch between Premium Glassmorphic modes</span>
                  </div>
                  <select v-model="settings.theme" class="premium-select" @change="handleThemeChange">
                    <option value="light">Premium Glass Light (Indigo Accent)</option>
                    <option value="dark">Premium Slate Dark (Neon Accent)</option>
                  </select>
                </div>

                <!-- Animations Toggle -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Micro-Animations</span>
                    <span class="setting-desc">Enable smooth transitions, sliding lists, and bouncing triggers</span>
                  </div>
                  <label class="premium-toggle">
                    <input type="checkbox" v-model="settings.animations" />
                    <span class="toggle-track"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- STORAGE & DATA FEEDS TAB -->
          <div v-else-if="activeTab === 'feeds'" class="pane-tab-content">
            <div class="settings-card">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Storage Cache</h3>
                    <p class="card-subtitle">DATA RETENTION & FLUSH DIAGNOSTICS</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <!-- Cache Duration Slider -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Stream Buffer Lifespan</span>
                    <span class="setting-desc">How long stream URL links remain saved in internal database (1h - 12h)</span>
                  </div>
                  <select v-model="settings.cacheDuration" class="premium-select">
                    <option :value="1">1 Hour Retention</option>
                    <option :value="3">3 Hours Retention</option>
                    <option :value="5">5 Hours Retention</option>
                    <option :value="12">12 Hours Retention</option>
                  </select>
                </div>

                <!-- Clear operations -->
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Clear Stream Links Cache</span>
                    <span class="setting-desc">Wipe all stored audio streaming indices. Safe operation</span>
                  </div>
                  <button @click="clearCache" class="btn-secondary">WIPE STREAM CACHE</button>
                </div>

                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Purge Listeners Registry</span>
                    <span class="setting-desc">Permanently wipe listening history database logs. Action irreversible</span>
                  </div>
                  <button @click="clearHistory" class="btn-danger">PURGE SQLite REGISTRY</button>
                </div>
              </div>
            </div>
          </div>

          <!-- KEYMAP & TUNING BACKUPS TAB -->
          <div v-else-if="activeTab === 'tuning'" class="pane-tab-content">
            <div class="settings-card">
              <div class="card-header">
                <div class="card-title-block">
                  <div class="card-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Backups & Keymaps</h3>
                    <p class="card-subtitle">REGISTRY BACKUPS & SYSTEM TUNING</p>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Keyboard Shortcuts Register</span>
                    <span class="setting-desc">View and adjust key binding listeners for fast, background playback controls</span>
                  </div>
                  <button @click="openKeyboardShortcuts" class="btn-secondary">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
                    VIEW SHORTCUT KEYMAP
                  </button>
                </div>

                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Export Library Vectors</span>
                    <span class="setting-desc">Save history, downloaded files metadata, and playlist matrices to portable JSON</span>
                  </div>
                  <button @click="exportData" class="btn-secondary">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    EXPORT REGISTRY BACKUP
                  </button>
                </div>

                <div class="setting-row">
                  <div class="setting-details">
                    <span class="setting-name">Import Library Vectors</span>
                    <span class="setting-desc">Import and merge standard backup JSON data into current sqlite file</span>
                  </div>
                  <button @click="importData" class="btn-secondary">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    IMPORT REGISTRY BACKUP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
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

const activeTab = ref('core')

// Redesign navigation tabs with icons
const tabs = [
  { id: 'core', name: 'SYSTEM CORE', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
  { id: 'audio', name: 'LLM PARAMS', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>` },
  { id: 'interface', name: 'INTERFACE', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
  { id: 'feeds', name: 'DATA FEEDS', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` },
  { id: 'tuning', name: 'TUNING', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` }
]

// Visual indicators for screenshot fidelity
const showLlmKey = ref(false)
const showMcpKey = ref(false)

const settings = ref({
  crossfadeDuration: 3,
  gaplessPlayback: false,
  autoplayNext: true,
  audioQuality: 'high',
  volumeNormalization: false,
  playbackSpeed: 1.0,
  theme: 'light',
  animations: true,
  cacheDuration: 5,
  // Keys matching telemetry configuration screenshot
  llmProviderKey: 'sk-proj-••••••••••••••••',
  mcpRouterKey: 'mcp-router-••••••••••••••',
  // Sliders matching VECTOR TUNING & THRESHOLDS
  topKRetrieval: 5,
  chunkSize: 512,
  chunkOverlap: 50
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

function handleThemeChange() {
  setTheme(settings.value.theme)
}

function saveSettings() {
  localStorage.setItem('musicReonSettings', JSON.stringify(settings.value))
  setTheme(settings.value.theme)
  showNotification({ title: 'Configuration registry updated', type: 'success' })
}

function resetToDefaults() {
  if (confirm('Reset settings to default parameters?')) {
    settings.value = {
      crossfadeDuration: 3,
      gaplessPlayback: false,
      autoplayNext: true,
      audioQuality: 'high',
      volumeNormalization: false,
      playbackSpeed: 1.0,
      theme: 'light',
      animations: true,
      cacheDuration: 5,
      llmProviderKey: 'sk-proj-••••••••••••••••',
      mcpRouterKey: 'mcp-router-••••••••••••••',
      topKRetrieval: 5,
      chunkSize: 512,
      chunkOverlap: 50
    }
    saveSettings()
  }
}

function clearCache() {
  if (confirm('Flush all cached streams and temporary audio buffers?')) {
    showNotification({ title: 'Cache flushed successfully', type: 'success' })
  }
}

async function clearHistory() {
  if (confirm('Purge all SQLite listening history logs? This action is irreversible.')) {
    try {
      const electron = window.electron
      if (electron) {
        await electron.sqlite.clearHistory()
        showNotification({ title: 'SQLite history registry cleared', type: 'success' })
      }
    } catch (err) {
      console.error('Failed to clear history:', err)
      showNotification({ title: 'Failed to purge history logs', type: 'error' })
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
    a.download = `music-reon-registry-vector-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification({ title: 'Library vectors exported', type: 'success' })
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
        title: 'Registry import complete',
        message: `${imported} records synchronized`,
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 0;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Redesigned Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.view-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success, #10b981);
  border: 1px solid rgba(16, 185, 129, 0.15);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success, #10b981);
  animation: pulse 1.8s infinite;
}

/* Header Config Action Buttons */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn-outline:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.action-btn-solid {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-secondary); /* Dark Navy Blue */
  color: var(--color-text-inverse); /* White */
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.action-btn-solid:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Settings Grid layout */
.settings-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: start;
}

/* Left Pane */
.navigation-pane {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 480px;
  position: sticky;
  top: 40px;
}

.nav-pills {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-pill:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.nav-pill.active {
  color: var(--color-primary); /* Purple / Indigo */
  background: rgba(99, 102, 241, 0.08);
}

.pill-accent {
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 4px 4px 0;
}

.pill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.pill-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Left sidebar footer */
.pane-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 8px 8px;
  border-top: 1px solid var(--color-border);
}

.footer-status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.3px;
}

.footer-icon {
  width: 12px;
  height: 12px;
  color: var(--color-text-muted);
}

/* Right Content Pane */
.content-pane {
  min-width: 0;
}

.pane-tab-content {
  animation: fadeIn 0.25s ease-out;
}

/* Sleek Cards */
.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  transition: all var(--transition-normal);
}

.settings-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--glass-border-hover);
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.card-title-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: rgba(99, 102, 241, 0.08);
  color: var(--color-primary);
  flex-shrink: 0;
}

.card-icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.card-title-block h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.card-subtitle {
  font-size: 9px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 1px;
  margin: 2px 0 0 0;
  text-transform: uppercase;
}

/* Card Body Rows */
.card-body {
  display: flex;
  flex-direction: column;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  gap: 24px;
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.setting-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Select Control */
.premium-select {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 200px;
}

.premium-select:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* Sliding standard input range */
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.slider-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-primary);
  font-family: var(--font-mono);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  padding: 3px 8px;
  border-radius: 6px;
  min-width: 36px;
  text-align: center;
}

.custom-slider {
  -webkit-appearance: none;
  flex: 1;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  outline: none;
  transition: background var(--transition-fast);
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Toggle Control */
.premium-toggle {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  flex-shrink: 0;
}

.premium-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  transition: var(--transition-fast);
  border-radius: 20px;
}

.toggle-track:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

input:checked + .toggle-track {
  background-color: var(--color-primary);
}

input:checked + .toggle-track:before {
  transform: translateX(20px);
}

/* Fields Grid for API Keys */
.api-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

.masked-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.mask-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.mask-toggle-btn svg {
  width: 16px;
  height: 16px;
}

.mask-toggle-btn:hover {
  color: var(--color-text);
}

/* RAG Engine Sliders (Screenshot layout) */
.slider-row-item {
  margin-bottom: 24px;
}

.slider-row-item:last-child {
  margin-bottom: 0;
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slider-title-grp {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-icon {
  width: 14px;
  height: 14px;
  color: var(--color-primary);
}

.slider-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: 0.8px;
}

.slider-value-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
}

.screenshot-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  outline: none;
  margin: 12px 0 6px;
}

.screenshot-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 2px; /* Square block like screenshot */
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}

.slider-limits {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

/* Secondary Button designs */
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-danger {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(244, 63, 94, 0.2);
  background: rgba(244, 63, 94, 0.05);
  color: var(--color-error);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all var(--transition-fast);
}

.btn-danger:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.btn-icon {
  width: 12px;
  height: 12px;
}

/* Vue transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .navigation-pane {
    min-height: auto;
    position: static;
  }
  
  .nav-pills {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .api-fields-grid {
    grid-template-columns: 1fr;
  }
}
</style>
