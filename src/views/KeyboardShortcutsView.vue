<template>
  <div class="shortcuts-view">
    <div class="view-header">
      <h1>Keyboard Shortcuts</h1>
      <p class="subtitle">Master Music Reon with these shortcuts</p>
    </div>

    <div class="shortcuts-grid">
      <!-- Playback Shortcuts -->
      <section class="shortcuts-section">
        <h2>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Playback
        </h2>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-action">Play/Pause</span>
            <kbd class="shortcut-key">Space</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Next Track</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">→</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Previous Track</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">←</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Volume Up</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">↑</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Volume Down</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">↓</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Mute</span>
            <kbd class="shortcut-key">M</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Shuffle</span>
            <kbd class="shortcut-key">S</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Repeat</span>
            <kbd class="shortcut-key">R</kbd>
          </div>
        </div>
      </section>

      <!-- Navigation Shortcuts -->
      <section class="shortcuts-section">
        <h2>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
          Navigation
        </h2>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-action">Go to Home</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">H</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Go to Search</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">F</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Go to Library</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">L</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Go to Favorites</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">D</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Toggle Queue</span>
            <kbd class="shortcut-key">Q</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Focus Search</span>
            <kbd class="shortcut-key">/</kbd>
          </div>
        </div>
      </section>

      <!-- Application Shortcuts -->
      <section class="shortcuts-section">
        <h2>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Application
        </h2>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-action">Settings</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">,</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Keyboard Shortcuts</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">/</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Reload App</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">R</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Toggle DevTools</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">Shift</kbd> + <kbd class="shortcut-key">I</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Quit App</span>
            <kbd class="shortcut-key">Ctrl</kbd> + <kbd class="shortcut-key">Q</kbd>
          </div>
        </div>
      </section>

      <!-- Media Keys -->
      <section class="shortcuts-section">
        <h2>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
          </svg>
          Media Keys
        </h2>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-action">Play/Pause</span>
            <kbd class="shortcut-key">Media Play/Pause</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Next Track</span>
            <kbd class="shortcut-key">Media Next</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Previous Track</span>
            <kbd class="shortcut-key">Media Previous</kbd>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-action">Stop</span>
            <kbd class="shortcut-key">Media Stop</kbd>
          </div>
        </div>
      </section>
    </div>

    <div class="shortcuts-footer">
      <p>💡 Tip: Most shortcuts work globally when the app is focused</p>
      <button @click="printShortcuts" class="print-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
        Print Shortcuts
      </button>
    </div>
  </div>
</template>

<script setup>
function printShortcuts() {
  window.print()
}
</script>

<style scoped>
.shortcuts-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: var(--space-xl);
  text-align: center;
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

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.shortcuts-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.shortcuts-section h2 {
  margin: 0 0 var(--space-lg) 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.shortcuts-section h2 svg {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.shortcut-item:hover {
  background: var(--color-surface-hover);
}

.shortcut-action {
  font-size: 0.875rem;
  color: var(--color-text);
}

.shortcut-key {
  display: inline-block;
  padding: 4px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  font-family: monospace;
  box-shadow: 0 2px 0 var(--color-border);
  margin: 0 2px;
}

.shortcuts-footer {
  text-align: center;
  padding: var(--space-xl);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.shortcuts-footer p {
  margin: 0 0 var(--space-md) 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.print-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.print-btn svg {
  width: 16px;
  height: 16px;
}

.print-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

@media print {
  .shortcuts-footer {
    display: none;
  }
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
