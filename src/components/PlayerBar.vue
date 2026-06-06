<template>
  <aside v-if="currentTrack" class="player-sidebar">
    <!-- Ambient Background Match Glow (Dual Layer) -->
    <div class="ambient-glow" :style="{ backgroundImage: track.thumbnail && !brokenImages.has(track.thumbnail) ? `url(${track.thumbnail})` : 'none' }"></div>
    <div class="ambient-glow ambient-glow-secondary" :style="{ backgroundImage: track.thumbnail && !brokenImages.has(track.thumbnail) ? `url(${track.thumbnail})` : 'none' }"></div>

      <!-- Sidebar Head / Tabs -->
      <div class="sidebar-head">
        <div class="tab-switcher" role="tablist" aria-label="Player views">
          <div class="tab-indicator" :class="{ right: activeTab === 'queue' }" aria-hidden="true"></div>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'player' }"
            @click="activeTab = 'player'"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'player'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span class="tab-label">Now Playing</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'queue' }"
            @click="activeTab = 'queue'"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'queue'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span class="tab-label">Queue</span>
            <span v-if="queueCount > 0" class="tab-count">{{ queueCount }}</span>
          </button>
        </div>
      </div>

    <!-- Main Scroll Content Area -->
    <div class="scroll-content">
      <!-- Player Tab View -->
      <div v-if="activeTab === 'player'" class="player-view-pane">
        <!-- Minimal artwork hero with vinyl toggle -->
        <div class="art-wrapper" style="--stagger: 0">
          <div class="artwork-frame" :class="{ 'vinyl-mode': artworkMode === 'vinyl' }">
            <img
              v-if="track.thumbnail && !brokenImages.has(track.thumbnail)"
              :src="track.thumbnail"
              @error="handleImageError(track.thumbnail)"
              class="artwork-img"
              :class="{ spinning: isPlaying && artworkMode === 'vinyl' }"
              :key="track.thumbnail"
              alt=""
            />
            <div v-else class="artwork-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <button
              v-if="track.thumbnail && !brokenImages.has(track.thumbnail)"
              class="vinyl-toggle"
              @click="toggleArtworkMode"
              :title="artworkMode === 'vinyl' ? 'Switch to square' : 'Switch to vinyl'"
              :aria-label="artworkMode === 'vinyl' ? 'Switch to square artwork' : 'Switch to vinyl artwork'"
              type="button"
            >
              <svg v-if="artworkMode === 'vinyl'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Track Info Header -->
        <div class="track-meta" style="--stagger: 1">
          <div class="meta-copy">
            <div class="track-title-wrapper" ref="titleWrapper">
              <h2
                class="track-title"
                :class="{ 'is-scrolling': titleOverflows }"
                ref="titleEl"
                :title="track.title"
                aria-live="polite"
                aria-atomic="true"
              >{{ track.title }}</h2>
            </div>
            <button
              v-if="track.artist"
              class="track-artist-btn"
              @click="searchArtist"
              :title="`Search for more by ${track.artist}`"
              :aria-label="`Search for more by ${track.artist}`"
            >
              <span class="track-artist">{{ track.artist }}</span>
              <svg class="artist-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7 7 17 7 17 17"/>
              </svg>
            </button>
            <p v-else class="track-artist">Unknown artist</p>
          </div>
        </div>

        <div class="track-subline" style="--stagger: 2">
          <span>{{ isPlaying ? 'Playing now' : (isLoading ? 'Loading…' : 'Paused') }}</span>
          <span>•</span>
          <span>{{ currentTrackPosition }} / {{ queueCount }}</span>
          <span>•</span>
          <span>{{ upcomingSongs.length }} next</span>
        </div>

        <div class="mini-actions" style="--stagger: 3">
          <FavoriteButton :song="track" class="fav-action-btn" />
          <PlaylistPicker :song="track" class="picker-action-btn" />
        </div>

        <!-- Quick Actions Row: search artist / lyrics / share -->
        <div class="quick-actions" style="--stagger: 4">
          <button
            class="qa-btn"
            @click="searchArtist"
            :disabled="!track.artist"
            title="More from this artist"
            aria-label="Search this artist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>More from artist</span>
          </button>
          <button
            class="qa-btn"
            @click="toggleLyrics"
            :class="{ active: showLyrics }"
            title="Lyrics (coming soon)"
            aria-label="View lyrics"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
            <span>Lyrics</span>
          </button>
          <button
            class="qa-btn"
            @click="shareTrack"
            title="Copy share link"
            aria-label="Share track"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>Share</span>
          </button>
        </div>

        <div v-if="upcomingSongs.length > 0" class="up-next-strip" style="--stagger: 5" @click="playQueueItem(upcomingSongs[0])">
          <span class="up-next-label">Up next</span>
          <div class="up-next-mini">
            <img v-if="upcomingSongs[0].thumbnail && !brokenImages.has(upcomingSongs[0].thumbnail)" :src="upcomingSongs[0].thumbnail" @error="handleImageError(upcomingSongs[0].thumbnail)" class="up-next-thumb" alt="" />
            <div v-else class="up-next-thumb up-next-thumb-empty">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="up-next-copy">
              <div class="up-next-title">{{ upcomingSongs[0].title }}</div>
              <div class="up-next-artist">{{ upcomingSongs[0].artist }}</div>
            </div>
          </div>
        </div>

        <!-- Now Playing Hub: fills the space when queue is empty -->
        <div v-else class="now-playing-hub" style="--stagger: 5">
          <div v-if="recentTracks.length > 0" class="hub-section">
            <div class="hub-section-head">
              <span class="hub-section-title">Recently played</span>
              <button class="hub-clear" @click="library.clearHistory()" v-if="library.history.length > 0" title="Clear history">Clear</button>
            </div>
            <div class="recent-list">
              <div
                v-for="item in recentTracks"
                :key="item.videoId || item.id"
                class="recent-item"
                @click="playRecent(item)"
                tabindex="0"
                @keydown.enter.prevent="playRecent(item)"
                @keydown.space.prevent="playRecent(item)"
                :aria-label="`Play ${item.title}`"
              >
                <img
                  v-if="item.thumbnail && !brokenImages.has(item.thumbnail)"
                  :src="item.thumbnail"
                  @error="handleImageError(item.thumbnail)"
                  class="recent-thumb"
                  alt=""
                />
                <div v-else class="recent-thumb recent-thumb-empty">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <div class="recent-info">
                  <div class="recent-title">{{ item.title }}</div>
                  <div class="recent-artist">{{ item.artist }}</div>
                </div>
                <button class="recent-play" @click.stop="playRecent(item)" :aria-label="`Play ${item.title}`" title="Play">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="hub-empty">
            <div class="hub-empty-art">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <p class="hub-empty-title">Your queue is empty</p>
            <p class="hub-empty-sub">Add songs from the search or library</p>
            <button class="hub-empty-btn" @click="$router.push('/search')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Discover music
            </button>
          </div>
        </div>
      </div>

      <!-- Queue Tab View -->
      <div v-else class="queue-view-pane">
        <!-- Queue Stats & Toolbar -->
        <div class="queue-toolbar">
          <div class="queue-stats">
            <span class="highlight">{{ queueCount }}</span> songs • {{ totalDurationLong }} total
          </div>
          <div class="queue-btns">
            <button class="tool-btn" @click="showSaveModal = true" title="Save queue as playlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save as Playlist
            </button>
            <button class="tool-btn danger" @click="clearQueue" title="Clear entire queue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear
            </button>
          </div>
        </div>

        <!-- Currently Playing Item inside Queue View -->
        <div class="queue-section-head">
          <span class="queue-sub-label">Now Playing</span>
          <span class="queue-position">{{ currentTrackPosition }} / {{ queueCount }}</span>
        </div>
        <div class="queue-item active-track">
          <div class="active-eq" aria-hidden="true">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
          <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" class="queue-thumb" alt="" />
          <div v-else class="queue-thumb queue-thumb-empty">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div class="queue-info">
            <div class="queue-track-title" :title="track.title">{{ track.title }}</div>
            <div class="queue-track-artist">{{ track.artist }}</div>
            <div class="mini-progress" v-if="progressPercent > 0">
              <div class="mini-progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
          <div class="queue-duration">{{ formatTime(duration) }}</div>
        </div>

        <!-- Draggable Next Up Items inside Queue View -->
        <div class="queue-section-head" v-if="upcomingSongs.length > 0">
          <span class="queue-sub-label">Next Up</span>
          <span class="queue-position">{{ upcomingSongs.length }} song{{ upcomingSongs.length === 1 ? '' : 's' }}</span>
        </div>
        <div v-else class="queue-section-head">
          <span class="queue-sub-label">Next Up</span>
        </div>
        <div class="queue-list-wrapper" role="listbox" :aria-label="`Up next: ${upcomingSongs.length} songs`">
          <draggable
            v-model="upcomingSongs"
            item-key="videoId"
            class="draggable-list"
            handle=".drag-handle"
            :animation="220"
            ghost-class="queue-ghost"
            drag-class="queue-dragging"
          >
            <template #item="{ element, index }">
              <div
                class="queue-item"
                role="option"
                :aria-selected="false"
                :tabindex="0"
                @keydown="onItemKeydown($event, element, index)"
                @focus="focusedIndex = index"
                @blur="focusedIndex = -1"
                :data-focused="focusedIndex === index"
                :data-index="index"
              >
                <div class="queue-pos" aria-hidden="true">{{ index + 1 }}</div>
                <div class="drag-handle" title="Drag to reorder" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="9" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/>
                    <circle cx="15" cy="6" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="18" r="1.2"/>
                  </svg>
                </div>
                <div class="queue-thumb-wrap" @click="playQueueItem(element)" :aria-label="`Play ${element.title}`">
                  <img v-if="element.thumbnail && !brokenImages.has(element.thumbnail)" :src="element.thumbnail" @error="handleImageError(element.thumbnail)" class="queue-thumb" alt="" />
                  <div v-else class="queue-thumb queue-thumb-empty">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div class="queue-info" @click="playQueueItem(element)">
                  <div class="queue-track-title" :title="element.title">{{ element.title }}</div>
                  <div class="queue-track-artist">{{ element.artist }}</div>
                  <div v-if="player.getItemMeta(element.videoId)?.sourceName" class="source-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                    </svg>
                    {{ player.getItemMeta(element.videoId).sourceName }}
                  </div>
                </div>
                <div class="queue-actions-cell">
                  <button
                    class="action-icon-btn move-top"
                    @click="moveToTop(index)"
                    :disabled="index === 0"
                    title="Move to top"
                    aria-label="Move to top of queue"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                    </svg>
                  </button>
                  <button
                    class="action-icon-btn remove"
                    @click="removeFromQueue(index)"
                    title="Remove track"
                    aria-label="Remove from queue"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div class="queue-duration">{{ formatTime(element.duration) }}</div>
              </div>
            </template>
          </draggable>
        </div>

        <div v-if="queueCount === 0" class="empty-queue-inline">
          <p>Queue is empty</p>
          <button class="browse-btn-inline" @click="$router.push('/search')">Browse music</button>
        </div>
        <div v-else-if="upcomingSongs.length === 0" class="next-up-empty">
          <p>End of queue</p>
          <button class="browse-btn-inline" @click="$router.push('/search')">Add more</button>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Controls Region -->
    <div class="fixed-bottom-bar">
      <!-- Progress/Timeline Bar -->
      <div class="progress-bar-container">
        <div
          class="timeline"
          @click="handleSeek"
          @mousemove="onTimelineHover"
          @mouseleave="onTimelineLeave"
          :aria-label="`Track progress: ${formatTime(currentTime)} of ${formatTime(duration)}`"
          @keydown.space.prevent="togglePlay"
        >
          <div class="timeline-track">
            <div class="timeline-fill-glow" :style="{ width: progressPercent + '%' }"></div>
            <div class="timeline-fill" :style="{ width: progressPercent + '%' }"></div>
            <div
              class="timeline-preview"
              v-show="hoverPercent !== null"
              :style="{ left: hoverPercent + '%' }"
            ></div>
            <div class="timeline-knob" :style="{ left: progressPercent + '%' }"></div>
          </div>
          <div
            v-show="hoverPercent !== null && duration > 0"
            class="timeline-tooltip"
            :style="{ left: hoverPercent + '%' }"
          >{{ formatTime(hoverTime) }}</div>
        </div>
        <div class="timeline-labels">
          <span class="timeline-current">{{ formatTime(currentTime) }}</span>
          <span class="timeline-total">-{{ formatTime(Math.max(0, duration - currentTime)) }}</span>
        </div>
      </div>

      <!-- Playback Actions (Spotify/Apple Music styled) -->
      <div class="playback-controls">
        <button class="ctrl-btn shuffle" :class="{ active: isShuffled }" @click="toggleShuffle" :title="isShuffled ? 'Shuffle: on' : 'Shuffle (S)'" :aria-pressed="isShuffled" :aria-label="`Shuffle ${isShuffled ? 'on' : 'off'}`">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y3="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
        </button>

        <button class="ctrl-btn previous" @click="playPrevious" :disabled="!hasPrevious" title="Previous (←)" aria-label="Previous track">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>

        <button class="play-pause-sphere" :class="{ playing: isPlaying }" @click="handlePlayPause" :disabled="isLoading" :title="`${isPlaying ? 'Pause' : 'Play'} (Space)`" :aria-label="isPlaying ? 'Pause' : 'Play'">
          <span class="ripple-ring" :class="{ animate: rippleActive }"></span>
          <span class="play-pulse" v-if="isPlaying"></span>
          <div v-if="isLoading" class="spinner"></div>
          <svg v-else-if="isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>

        <button class="ctrl-btn next" @click="playNext" :disabled="!hasNext" title="Next (→)" aria-label="Next track">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>

        <button class="ctrl-btn repeat" :class="{ active: repeatMode !== 'off', 'repeat-one-mode': repeatMode === 'one', 'repeat-all-mode': repeatMode === 'all' }" @click="cycleRepeatMode" :title="`Repeat: ${repeatMode} (R)`" :aria-label="`Repeat mode: ${repeatMode}`">
          <svg v-if="repeatMode !== 'one'" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <span v-if="repeatMode === 'one'" class="repeat-one-badge" aria-hidden="true">1</span>
          <span v-else-if="repeatMode === 'all'" class="repeat-mode-badge" aria-hidden="true">ALL</span>
        </button>
      </div>

      <!-- Accessory Strip: Sleep Timer, Volume Bar, Playback Speed -->
      <div class="accessory-controls">
        <div class="accessory-group accessory-left">
          <!-- Sleep Timer -->
          <div class="popover-wrapper">
            <button class="acc-btn" :class="{ active: sleepActive }" @click="showSleepPicker = !showSleepPicker; showSpeedPicker = false" :title="sleepActive ? `Sleep: ${sleepRemaining}` : 'Sleep Timer'" aria-label="Sleep timer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <span v-if="sleepActive" class="sleep-dot"></span>
            </button>

            <transition name="popover-fade">
              <div v-if="showSleepPicker" class="popover-card" @click.stop>
                <div class="popover-title">Sleep Timer</div>
                <button class="popover-option" @click="setSleepTimer(15)">15 minutes</button>
                <button class="popover-option" @click="setSleepTimer(30)">30 minutes</button>
                <button class="popover-option" @click="setSleepTimer(60)">1 hour</button>
                <button class="popover-option" @click="setSleepTimer(90)">1.5 hours</button>
                <button v-if="sleepActive" class="popover-option cancel" @click="cancelSleepTimer">Cancel Timer</button>
              </div>
            </transition>
          </div>
        </div>

        <div class="accessory-group accessory-center">
          <!-- Minimal Slider Volume Control -->
          <div class="slider-volume">
            <button class="mute-btn" @click="setVolume(volume === 0 ? 50 : 0)" :title="`${volume === 0 ? 'Unmute' : 'Mute'} (M)`" :aria-label="volume === 0 ? 'Unmute' : 'Mute'">
              <svg v-if="volume === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              <svg v-else-if="volume < 50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
            <input type="range" min="0" max="100" v-model="volume" class="volume-slider-bar" :style="`--vol: ${volume}%`" @input="setVolume(parseInt(volume))" :aria-label="`Volume ${volume}%`" :title="`Volume ${volume}%`" />
            <div class="volume-readout" :class="{ 'is-muted': volume === 0 }">
              <span class="volume-num">{{ volume }}</span>
              <span class="volume-pct">%</span>
            </div>
          </div>
        </div>

        <div class="accessory-group accessory-right">
          <!-- Playback Speed -->
          <div class="popover-wrapper">
            <button class="acc-btn speed-btn" :class="{ active: playbackSpeed !== 1 }" @click="showSpeedPicker = !showSpeedPicker; showSleepPicker = false" title="Playback Speed">
              <span class="speed-label">{{ playbackSpeed }}x</span>
            </button>

            <transition name="popover-fade">
              <div v-if="showSpeedPicker" class="popover-card speed-card" @click.stop>
                <div class="popover-title">Playback Speed</div>
                <button
                  v-for="speed in speedOptions"
                  :key="speed"
                  class="popover-option"
                  :class="{ active: playbackSpeed === speed }"
                  @click="setPlaybackSpeed(speed)"
                >{{ speed }}x</button>
              </div>
            </transition>
          </div>

          <!-- Queue Drawer Toggle -->
          <button class="acc-btn" @click="emit('toggleQueue')" title="Open queue drawer (Q)" aria-label="Open queue drawer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Indicator -->
    <div v-if="error" class="error-toast" @click="error = null">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
      <button class="retry-btn" @click.stop="retryCurrent" aria-label="Retry">Retry</button>
    </div>

    <CreatePlaylistModal
      v-model:show="showSaveModal"
      title="Save Queue as Playlist"
      action-label="Save"
      placeholder="Queue backup"
      @created="onSaveCreated"
    />
  </aside>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { storeToRefs } from 'pinia'
import { useQueue } from '../composables/useQueue.js'
import { formatTime } from '../utils/queueFormat.js'
import FavoriteButton from './FavoriteButton.vue'
import PlaylistPicker from './PlaylistPicker.vue'
import CreatePlaylistModal from './CreatePlaylistModal.vue'
import { useSleepTimer } from '../composables/useSleepTimer.js'
import { useNotifications } from '../composables/useNotifications.js'
import draggable from 'vuedraggable'

const router = useRouter()
const emit = defineEmits(['toggleQueue'])
const player = usePlayerStore()
const library = useLibraryStore()
const { currentTrack, isPlaying, currentTime, duration, volume, isLoading, repeatMode, isShuffled, hasNext, hasPrevious, progressPercent, error, queue, currentIndex } = storeToRefs(player)
const { togglePlay, playNext, playPrevious, seekTo, setVolume, toggleShuffle, cycleRepeatMode } = player

const activeTab = ref('player')

// Reuse the shared queue composable
const {
  brokenImages,
  handleImageError,
  track,
  queueCount,
  currentTrackPosition,
  upcomingSongs,
  totalDurationLong,
  playQueueItem,
  removeFromQueue,
  moveToTop,
  clearQueue
} = useQueue()

const showSaveModal = ref(false)
const focusedIndex = ref(-1)

// Artwork display mode (square vs vinyl) - persisted
const ARTWORK_MODE_KEY = 'musicReonArtworkMode'
const artworkMode = ref(
  (typeof localStorage !== 'undefined' && localStorage.getItem(ARTWORK_MODE_KEY)) || 'square'
)
function toggleArtworkMode() {
  artworkMode.value = artworkMode.value === 'vinyl' ? 'square' : 'vinyl'
  try {
    localStorage.setItem(ARTWORK_MODE_KEY, artworkMode.value)
  } catch (e) {
    // ignore
  }
}

// Marquee title overflow detection
const titleEl = ref(null)
const titleWrapper = ref(null)
const titleOverflows = ref(false)

function checkTitleOverflow() {
  nextTick(() => {
    if (titleEl.value && titleWrapper.value) {
      titleOverflows.value = titleEl.value.scrollWidth > titleWrapper.value.clientWidth + 2
    }
  })
}

let titleObserver = null
onMounted(() => {
  checkTitleOverflow()
  if (titleWrapper.value && window.ResizeObserver) {
    titleObserver = new ResizeObserver(checkTitleOverflow)
    titleObserver.observe(titleWrapper.value)
  }
  if (library.history.length === 0) {
    library.loadHistory()
  }
})
onBeforeUnmount(() => {
  if (titleObserver) titleObserver.disconnect()
})

watch(() => currentTrack.value, () => {
  checkTitleOverflow()
  focusedIndex.value = -1
}, { deep: true })

// Play/pause ripple effect
const rippleActive = ref(false)
function handlePlayPause() {
  rippleActive.value = true
  togglePlay()
  setTimeout(() => { rippleActive.value = false }, 600)
}

const { isActive: sleepActive, remainingTime: sleepRemaining, setTimer, cancelTimer } = useSleepTimer(player)
const { showNotification } = useNotifications()
const showSleepPicker = ref(false)

const playbackSpeed = ref(1)
const showSpeedPicker = ref(false)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

function setPlaybackSpeed(speed) {
  playbackSpeed.value = speed
  player.applyPlaybackSpeed(speed)
  try {
    const saved = JSON.parse(localStorage.getItem('musicReonSettings') || '{}')
    saved.playbackSpeed = speed
    localStorage.setItem('musicReonSettings', JSON.stringify(saved))
  } catch (e) {}
  showSpeedPicker.value = false
}

function setSleepTimer(minutes) {
  setTimer(minutes)
  showSleepPicker.value = false
  showNotification({ title: 'Sleep Timer Set', message: `Device will pause in ${minutes} minutes`, type: 'info' })
}

function cancelSleepTimer() {
  cancelTimer()
  showSleepPicker.value = false
  showNotification({ title: 'Sleep Timer Cancelled', type: 'info' })
}

function onItemKeydown(e, item, index) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    playQueueItem(item)
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    removeFromQueue(index)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (index > 0) moveToTop(index)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (index < upcomingSongs.value.length - 1) {
      const list = upcomingSongs.value
      const newList = [...list]
      ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
      upcomingSongs.value = newList
    }
  }
}

function handleSeek(e) {
  const r = e.currentTarget.getBoundingClientRect()
  seekTo(((e.clientX - r.left) / r.width) * 100)
}

const hoverPercent = ref(null)
const hoverTime = ref(0)
function onTimelineHover(e) {
  const r = e.currentTarget.getBoundingClientRect()
  if (r.width === 0) return
  const pct = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
  hoverPercent.value = pct
  hoverTime.value = (pct / 100) * duration.value
}
function onTimelineLeave() {
  hoverPercent.value = null
}

const recentTracks = computed(() => {
  const cur = currentTrack.value
  const history = library.history || []
  return history
    .filter((item) => item && (item.videoId || item.video_id) !== (cur?.videoId || ''))
    .slice()
    .sort((a, b) => (b.played_at || b.playedAt || 0) - (a.played_at || a.playedAt || 0))
    .slice(0, 4)
    .map((item) => ({
      videoId: item.videoId || item.video_id || '',
      title: item.title || 'Unknown',
      artist: item.artist || 'Unknown',
      thumbnail: item.thumbnail || item.thumbnail_url || ''
    }))
})

function playRecent(item) {
  if (!item?.videoId) return
  player.playTrack({
    videoId: item.videoId,
    title: item.title,
    artist: item.artist,
    thumbnail: item.thumbnail,
    duration: item.duration || 0
  })
}
</script>

<style scoped>
.player-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--player-sidebar-width);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-left: var(--glass-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  height: 100vh;
}

/* ===== SOLID WHITE/GREY BACKGROUND (LIGHT THEME) ===== */
.player-sidebar {
  /* Light theme token overrides */
  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-text-inverse: #f8fafc;
  --color-border: rgba(15, 23, 42, 0.1);
  --color-border-light: rgba(15, 23, 42, 0.18);
  --color-surface: rgba(255, 255, 255, 0.85);
  --color-surface-elevated: #ffffff;
  --color-surface-hover: rgba(15, 23, 42, 0.05);
  --color-surface-active: rgba(15, 23, 42, 0.1);
  --color-background: #f1f5f9;
  --glass-bg: #f8fafc;
  --glass-blur: none;
  --glass-border: 1px solid rgba(15, 23, 42, 0.08);
  --glass-border-hover: 1px solid rgba(99, 102, 241, 0.4);
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.06);

  background:
    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 70%),
    linear-gradient(180deg, #ffffff 0%, #f1f5f9 55%, #e2e8f0 100%);
  color: #0f172a;
  border-left: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: -10px 0 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.ambient-glow,
.ambient-glow-secondary {
  display: none;
}

/* ===== LIGHT THEME: DESCENDANT OVERRIDES ===== */

/* Sidebar head + tab switcher */
.player-sidebar .sidebar-head {
  background: rgba(255, 255, 255, 0.55);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.player-sidebar .tab-switcher {
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.player-sidebar .tab-btn {
  color: #64748b;
}

.player-sidebar .tab-btn:hover {
  color: #0f172a;
}

.player-sidebar .tab-count {
  background: rgba(15, 23, 42, 0.08);
  color: #475569;
}

/* Artwork frame */
.player-sidebar .artwork-frame {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.02));
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.player-sidebar .artwork-frame.vinyl-mode {
  box-shadow:
    0 0 0 4px rgba(15, 23, 42, 0.18),
    0 0 0 5px rgba(15, 23, 42, 0.04),
    0 0 0 6px rgba(99, 102, 241, 0.22),
    0 16px 50px rgba(15, 23, 42, 0.18);
}

.player-sidebar .vinyl-toggle {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
}

.player-sidebar .vinyl-toggle:hover {
  background: #ffffff;
  border-color: #6366f1;
  color: #6366f1;
}

/* Track meta + subline */
.player-sidebar .track-title {
  color: #0f172a;
}

.player-sidebar .track-artist-btn {
  color: #475569;
}

.player-sidebar .track-artist-btn:hover:not(:disabled) {
  color: #6366f1;
}

.player-sidebar .track-subline {
  color: #94a3b8;
}

/* Mini action buttons (heart, +) */
.player-sidebar :deep(.favorite-btn),
.player-sidebar :deep(.playlist-picker-btn),
.player-sidebar .fav-action-btn,
.player-sidebar .picker-action-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.1);
  color: #475569;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.player-sidebar :deep(.favorite-btn:hover),
.player-sidebar :deep(.playlist-picker-btn:hover),
.player-sidebar .fav-action-btn:hover,
.player-sidebar .picker-action-btn:hover {
  background: #ffffff;
  border-color: #6366f1;
  color: #6366f1;
}

.player-sidebar :deep(.favorite-btn.active) {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.08);
  border-color: rgba(236, 72, 153, 0.3);
}

/* Quick action row */
.player-sidebar .qa-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.1);
  color: #475569;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.player-sidebar .qa-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.35);
  color: #6366f1;
}

.player-sidebar .qa-btn.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: #6366f1;
}

/* Up next strip */
.player-sidebar .up-next-strip {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.player-sidebar .up-next-strip:hover {
  background: #ffffff;
  border-color: rgba(99, 102, 241, 0.3);
}

.player-sidebar .up-next-thumb-empty {
  background: rgba(15, 23, 42, 0.05);
  color: #6366f1;
}

/* Now playing hub */
.player-sidebar .now-playing-hub {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.player-sidebar .hub-clear {
  color: #94a3b8;
}

.player-sidebar .hub-clear:hover {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.08);
}

/* Recent items */
.player-sidebar .recent-item {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.player-sidebar .recent-item:hover,
.player-sidebar .recent-item:focus-visible {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.3);
}

.player-sidebar .recent-thumb-empty {
  background: rgba(15, 23, 42, 0.05);
  color: #6366f1;
}

.player-sidebar .recent-play {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.1);
  color: #94a3b8;
}

.player-sidebar .recent-item:hover .recent-play {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* Hub empty state */
.player-sidebar .hub-empty-art {
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed rgba(99, 102, 241, 0.4);
  color: #6366f1;
}

.player-sidebar .hub-empty-title {
  color: #0f172a;
}

.player-sidebar .hub-empty-sub {
  color: #64748b;
}

.player-sidebar .hub-empty-btn {
  background: transparent;
  border: 1px solid #6366f1;
  color: #6366f1;
}

.player-sidebar .hub-empty-btn:hover {
  background: #6366f1;
  color: white;
}

/* Queue toolbar + items */
.player-sidebar .queue-toolbar {
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.player-sidebar .tool-btn {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.1);
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.player-sidebar .tool-btn:hover {
  background: #ffffff;
  border-color: #6366f1;
  color: #6366f1;
}

.player-sidebar .tool-btn.danger:hover {
  background: rgba(244, 63, 94, 0.08);
  border-color: #f43f5e;
  color: #f43f5e;
}

.player-sidebar .queue-stats {
  color: #475569;
}

.player-sidebar .queue-stats .highlight {
  color: #6366f1;
}

.player-sidebar .queue-item {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
}

.player-sidebar .queue-item:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(15, 23, 42, 0.06);
}

.player-sidebar .queue-item.active-track {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04));
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.player-sidebar .queue-item[data-focused="true"] {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
}

.player-sidebar .queue-thumb-empty {
  background: rgba(15, 23, 42, 0.05);
  color: #6366f1;
}

.player-sidebar .queue-thumb-wrap .play-overlay {
  background: rgba(15, 23, 42, 0.6);
}

.player-sidebar .queue-track-title {
  color: #0f172a;
}

.player-sidebar .queue-track-artist {
  color: #64748b;
}

.player-sidebar .source-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.player-sidebar .action-icon-btn {
  color: #94a3b8;
}

.player-sidebar .action-icon-btn:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.player-sidebar .action-icon-btn.remove:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.player-sidebar .queue-duration {
  color: #94a3b8;
}

/* Mini progress on active track */
.player-sidebar .mini-progress {
  background: rgba(15, 23, 42, 0.08);
}

/* Active EQ bars */
.player-sidebar .active-eq .bar {
  background: #6366f1;
}

/* Empty queue state */
.player-sidebar .empty-queue-inline {
  color: #94a3b8;
}

/* Fixed bottom bar */
.player-sidebar .fixed-bottom-bar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Progress bar / timeline */
.player-sidebar .timeline-track {
  background: rgba(15, 23, 42, 0.12);
}

.player-sidebar .timeline:hover .timeline-track {
  background: rgba(15, 23, 42, 0.16);
}

.player-sidebar .timeline-knob {
  background: white;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5), 0 0 2px rgba(15, 23, 42, 0.2);
}

.player-sidebar .timeline:hover .timeline-knob,
.player-sidebar .timeline:focus-visible .timeline-knob {
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6), 0 0 3px rgba(15, 23, 42, 0.2);
}

.player-sidebar .timeline-tooltip {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.player-sidebar .timeline-current {
  color: #0f172a;
}

.player-sidebar .timeline-total {
  color: #94a3b8;
}

/* Playback controls */
.player-sidebar .ctrl-btn {
  color: #475569;
}

.player-sidebar .ctrl-btn:hover:not(:disabled) {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.06);
}

.player-sidebar .ctrl-btn.active {
  color: #6366f1;
}

.player-sidebar .ctrl-btn.active.shuffle,
.player-sidebar .ctrl-btn.active.repeat {
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3) inset;
}

.player-sidebar .ctrl-btn.repeat.repeat-one-mode {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
  box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.35) inset;
}

.player-sidebar .repeat-one-badge {
  color: #ec4899;
  background: white;
  box-shadow: 0 0 4px rgba(236, 72, 153, 0.4);
}

.player-sidebar .repeat-mode-badge {
  color: #6366f1;
  background: white;
  box-shadow: 0 0 3px rgba(99, 102, 241, 0.4);
}

/* Play/pause sphere: keep gradient, just light glow on light bg */
.player-sidebar .play-pause-sphere {
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
}

.player-sidebar .play-pause-sphere:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

/* Accessory strip */
.player-sidebar .accessory-controls {
  /* no override needed; grid layout same */
}

.player-sidebar .acc-btn {
  color: #64748b;
}

.player-sidebar .acc-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.05);
}

.player-sidebar .acc-btn.active {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.player-sidebar .sleep-dot {
  background: #ec4899;
  box-shadow: 0 0 6px rgba(236, 72, 153, 0.6);
}

.player-sidebar .speed-badge {
  background: #ec4899;
  color: white;
}

/* Volume control */
.player-sidebar .slider-volume {
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.player-sidebar .slider-volume:hover {
  background: rgba(15, 23, 42, 0.08);
  border-color: rgba(15, 23, 42, 0.14);
}

.player-sidebar .mute-btn {
  color: #64748b;
}

.player-sidebar .mute-btn:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.player-sidebar .volume-readout {
  color: #475569;
}

.player-sidebar .volume-readout.is-muted {
  color: #f43f5e;
}

.player-sidebar .volume-slider-bar {
  background: linear-gradient(
    to right,
    #6366f1 0%,
    #ec4899 var(--vol, 0%),
    rgba(15, 23, 42, 0.12) var(--vol, 0%),
    rgba(15, 23, 42, 0.12) 100%
  );
}

/* Popover cards (sleep timer, speed picker) */
.player-sidebar .popover-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
}

.player-sidebar .popover-title {
  color: #64748b;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.player-sidebar .popover-option {
  color: #0f172a;
}

.player-sidebar .popover-option:hover {
  background: rgba(15, 23, 42, 0.04);
}

.player-sidebar .popover-option.active {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.player-sidebar .popover-option.cancel {
  color: #f43f5e;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

/* Error toast */
.player-sidebar .error-toast {
  background: #f43f5e;
  color: white;
  box-shadow: 0 8px 24px rgba(244, 63, 94, 0.3);
}

/* Sliding tab indicator: keep gradient */
.player-sidebar .tab-indicator {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

/* ===== HEADER & TABS ===== */
.sidebar-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  z-index: 2;
  position: relative;
  background: rgba(15, 23, 42, 0.2);
}

.tab-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 3px;
  position: relative;
}

.tab-btn {
  position: relative;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition-normal);
  z-index: 1;
}

.tab-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 2.2;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent, #ec4899));
  color: white;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

/* ===== SCROLLABLE CONTENT ===== */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.scroll-content::-webkit-scrollbar {
  width: 4px;
}

.scroll-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
}

.player-view-pane,
.queue-view-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

/* Fade-in stagger animation for player view elements */
.player-view-pane > [style*="--stagger"] {
  animation: fadeSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--stagger) * 80ms + 100ms);
}

.queue-view-pane > * {
  animation: fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--stagger, 0) * 60ms + 80ms);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== ARTWORK (SQUARE + VINYL MODES) ===== */
.art-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0 0;
  position: relative;
}

.artwork-frame {
  position: relative;
  width: min(100%, 220px);
  aspect-ratio: 1;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.artwork-frame.vinyl-mode {
  border-radius: 50%;
  box-shadow:
    0 0 0 4px rgba(0, 0, 0, 0.4),
    0 0 0 5px rgba(255, 255, 255, 0.06),
    0 0 0 6px rgba(99, 102, 241, 0.18),
    0 16px 50px rgba(0, 0, 0, 0.35);
}

.artwork-frame .artwork-img,
.artwork-frame .artwork-placeholder {
  width: 100%;
  height: 100%;
}

.artwork-img {
  object-fit: cover;
  display: block;
  animation: artFadeIn 0.4s ease;
  transition: border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.artwork-frame.vinyl-mode .artwork-img {
  border-radius: 50%;
  animation: artFadeIn 0.4s ease;
}

.artwork-img.spinning {
  animation: vinylSpin 8s linear infinite;
}

@keyframes vinylSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes artFadeIn {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}

.artwork-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.artwork-placeholder svg {
  width: 40px;
  height: 40px;
}

.vinyl-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all var(--transition-fast);
  z-index: 2;
}

.vinyl-toggle svg {
  width: 16px;
  height: 16px;
}

.artwork-frame:hover .vinyl-toggle,
.artwork-frame:focus-within .vinyl-toggle {
  opacity: 1;
  transform: scale(1);
}

.vinyl-toggle:hover {
  background: rgba(15, 23, 42, 0.85);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ===== TRACK METADATA & MARQUEE TITLE ===== */
.track-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.meta-copy {
  min-width: 0;
  flex: 1;
  width: 100%;
}

.track-subline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.track-title-wrapper {
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 92%, transparent 100%);
}

.track-title {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 750;
  color: var(--color-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
  line-height: 1.3;
}

.track-title.is-scrolling {
  display: inline-block;
  animation: marqueeScroll 12s linear infinite;
  padding-right: 60px;
}

.track-title.is-scrolling::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  padding-left: 60px;
}

@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-100% - 60px)); }
}

.track-artist {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 2px 0;
  margin: 0;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 500;
  max-width: 100%;
  min-width: 0;
  transition: color var(--transition-fast);
}

.track-artist-btn .track-artist {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.track-artist-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.track-artist-btn:hover:not(:disabled) .artist-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
}

.track-artist-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.artist-arrow {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  opacity: 0;
  transition: all var(--transition-fast);
  color: var(--color-primary);
}

.mini-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 2px;
}

:deep(.favorite-btn),
:deep(.playlist-picker-btn),
.fav-action-btn,
.picker-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

:deep(.favorite-btn:hover),
:deep(.playlist-picker-btn:hover),
.fav-action-btn:hover,
.picker-action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--color-primary);
  transform: translateY(-1px);
}

:deep(.favorite-btn.active) {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.up-next-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.up-next-strip:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.14);
}

.up-next-label {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.up-next-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.up-next-thumb {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.up-next-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
}

.up-next-thumb-empty svg {
  width: 16px;
  height: 16px;
}

.up-next-copy {
  min-width: 0;
  flex: 1;
}

.up-next-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-next-artist {
  margin-top: 2px;
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== QUICK ACTIONS ROW ===== */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

.qa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 0.66rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  overflow: hidden;
}

.qa-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.qa-btn span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.qa-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.qa-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.qa-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.5);
  color: var(--color-primary);
}

.qa-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== NOW PLAYING HUB (Recent + Empty state) ===== */
.now-playing-hub {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(15, 23, 42, 0.18);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: 4px;
}

.hub-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.hub-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.hub-section-title {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hub-clear {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);
}

.hub-clear:hover {
  color: var(--color-error);
  background: rgba(244, 63, 94, 0.08);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.recent-list::-webkit-scrollbar {
  width: 3px;
}

.recent-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
}

.recent-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 28px;
  gap: 10px;
  align-items: center;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
  min-height: 50px;
}

.recent-item:hover,
.recent-item:focus-visible {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(2px);
}

.recent-item:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.recent-thumb {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.recent-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-primary);
}

.recent-thumb-empty svg {
  width: 14px;
  height: 14px;
}

.recent-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-artist {
  font-size: 0.66rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.recent-play svg {
  width: 11px;
  height: 11px;
}

.recent-item:hover .recent-play {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.recent-play:hover {
  background: var(--color-primary) !important;
  color: white !important;
  transform: scale(1.08);
}

.hub-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 12px 8px;
  min-height: 120px;
}

.hub-empty-art {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed rgba(99, 102, 241, 0.4);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.hub-empty-art svg {
  width: 22px;
  height: 22px;
}

.hub-empty-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.hub-empty-sub {
  margin: 0;
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  max-width: 200px;
}

.hub-empty-btn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hub-empty-btn svg {
  width: 13px;
  height: 13px;
}

.hub-empty-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
}

/* ===== QUEUE LIST VIEW ===== */
.queue-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(15, 23, 42, 0.2);
  border-radius: var(--radius-md);
  padding: 12px;
  border: 1px solid var(--color-border);
}

.queue-stats {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.queue-stats .highlight {
  color: var(--color-primary);
  font-weight: 700;
}

.queue-btns {
  display: flex;
  gap: 8px;
}

.tool-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all var(--transition-normal);
}

.tool-btn svg {
  width: 14px;
  height: 14px;
}

.tool-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tool-btn.danger:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

.queue-sub-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Queue items */
.queue-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.queue-item {
  display: grid;
  grid-template-columns: 18px 18px 48px minmax(0, 1fr) auto 40px;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
  border-left: 3px solid transparent;
  transition: all var(--transition-normal);
  outline: none;
  min-height: 64px;
  position: relative;
}

.queue-item[data-focused="true"] {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(2px);
}

.queue-item:hover {
  background: rgba(99, 102, 241, 0.04);
  transform: translateX(2px);
  border-color: rgba(15, 23, 42, 0.06);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.queue-item.active-track {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.03));
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-left: 3px solid #6366f1;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.1);
}

.queue-item.active-track:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(99, 102, 241, 0.05));
}

/* Position number */
.queue-pos {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
  font-feature-settings: 'tnum' 1;
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
  text-align: center;
  letter-spacing: 0.02em;
  width: 18px;
  transition: color var(--transition-fast);
}

.queue-item:hover .queue-pos,
.queue-item[data-focused="true"] .queue-pos {
  color: #6366f1;
}

/* Action cell container */
.queue-actions-cell {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateX(4px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.queue-item:hover .queue-actions-cell,
.queue-item[data-focused="true"] .queue-actions-cell {
  opacity: 1;
  transform: translateX(0);
}

/* vuedraggable states */
.queue-ghost {
  opacity: 0.4;
  background: rgba(99, 102, 241, 0.06) !important;
  border-color: rgba(99, 102, 241, 0.3) !important;
  border-style: dashed !important;
}

.queue-dragging {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.15) !important;
  background: #ffffff !important;
  border-color: rgba(99, 102, 241, 0.4) !important;
  transform: scale(1.02);
}

/* Section header with position count */
.queue-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  margin-top: 10px;
}

.queue-sub-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-sub-label::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.5);
}

.queue-position {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
  font-feature-settings: 'tnum' 1;
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
  letter-spacing: 0.02em;
}

/* Next up empty state */
.next-up-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 16px;
  color: #94a3b8;
  text-align: center;
  background: rgba(15, 23, 42, 0.02);
  border: 1px dashed rgba(15, 23, 42, 0.1);
  border-radius: var(--radius-md);
}

.next-up-empty p {
  margin: 0;
  font-size: 0.78rem;
}

.browse-btn-inline {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid #6366f1;
  background: transparent;
  color: #6366f1;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.browse-btn-inline:hover {
  background: #6366f1;
  color: white;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: rgba(148, 163, 184, 0.5);
  opacity: 0.4;
  transition: all var(--transition-fast);
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.drag-handle svg {
  width: 12px;
  height: 12px;
}

.queue-item:hover .drag-handle,
.queue-item[data-focused="true"] .drag-handle {
  opacity: 1;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.04);
}

.drag-handle:hover {
  color: #6366f1 !important;
  background: rgba(99, 102, 241, 0.1) !important;
}

.drag-handle:active {
  cursor: grabbing;
}

.queue-thumb-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.queue-item:hover .queue-thumb-wrap {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
}

.queue-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.queue-thumb-empty {
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.queue-thumb-empty svg {
  width: 18px;
  height: 18px;
}

.queue-thumb-wrap .play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.queue-thumb-wrap:hover .play-overlay {
  opacity: 1;
}

.play-overlay svg {
  width: 18px;
  height: 18px;
  color: white;
}

.queue-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.queue-track-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-track .queue-track-title {
  color: var(--color-primary);
}

.queue-track-artist {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-primary);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  align-self: flex-start;
  max-width: 100%;
}

.source-badge svg {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
}

.action-icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-normal);
}

.queue-item:hover .action-icon-btn,
.queue-item[data-focused="true"] .action-icon-btn {
  opacity: 1;
}

.action-icon-btn svg {
  width: 13px;
  height: 13px;
}

.action-icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.action-icon-btn.remove:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.12);
  color: var(--color-error);
}

.action-icon-btn.move-top:hover:not(:disabled) {
  color: var(--color-primary);
}

.action-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.queue-duration {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  text-align: right;
}

/* EQ indicator (active track) */
.active-eq {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 18px;
  height: 24px;
  flex-shrink: 0;
}

.active-eq .bar {
  width: 2px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 1px;
  animation: barGrow 0.8s ease-in-out infinite alternate;
}

.active-eq .bar:nth-child(2) {
  animation-delay: 0.25s;
}

.active-eq .bar:nth-child(3) {
  animation-delay: 0.45s;
}

@keyframes barGrow {
  0% { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

.mini-progress {
  margin-top: 4px;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent, #ec4899));
  border-radius: var(--radius-full);
  transition: width 0.3s linear;
}

.empty-queue-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-queue-inline p {
  margin: 0;
  font-size: 0.85rem;
}

.browse-btn-inline {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.browse-btn-inline:hover {
  background: var(--color-primary);
  color: white;
}

/* ===== FIXED BOTTOM CONTROLS ===== */
.fixed-bottom-bar {
  z-index: 2;
  position: relative;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0.88) 100%);
  border-top: 1px solid var(--color-border);
  padding: 14px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  backdrop-filter: blur(10px);
}

/* ===== GRADIENT PROGRESS BAR ===== */
.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline {
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  outline: none;
}

.timeline:focus-visible .timeline-track {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.timeline-track {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  position: relative;
  transition: height var(--transition-fast), background var(--transition-fast);
}

.timeline:hover .timeline-track {
  height: 7px;
  background: rgba(255, 255, 255, 0.14);
}

.timeline-fill-glow {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-full);
  position: absolute;
  top: 0;
  left: 0;
  filter: blur(6px);
  opacity: 0.55;
  transition: opacity var(--transition-fast);
}

.timeline:hover .timeline-fill-glow {
  opacity: 0.75;
}

.timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-full);
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.15) inset;
}

.timeline-preview {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-full);
  transform: translateX(-50%);
  pointer-events: none;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
  z-index: 2;
}

.timeline-knob {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px var(--color-primary), 0 0 2px rgba(0,0,0,0.3);
  transition: transform var(--transition-fast), width var(--transition-fast), height var(--transition-fast), box-shadow var(--transition-fast);
  z-index: 3;
  opacity: 0;
}

.timeline:hover .timeline-knob,
.timeline:focus-visible .timeline-knob {
  opacity: 1;
  width: 14px;
  height: 14px;
  box-shadow: 0 0 12px var(--color-primary), 0 0 3px rgba(0,0,0,0.4);
}

.timeline-tooltip {
  position: absolute;
  bottom: calc(100% + 4px);
  transform: translateX(-50%);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
  animation: tooltipIn 0.12s ease-out;
}

@keyframes tooltipIn {
  from { opacity: 0; transform: translateX(-50%) translateY(2px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  font-variant-numeric: tabular-nums;
  padding: 0 2px;
}

.timeline-current {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.02em;
}

.timeline-total {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

/* ===== PLAYBACK CONTROLS ===== */
.playback-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.ctrl-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  position: relative;
}

.ctrl-btn svg {
  width: 20px;
  height: 20px;
}

.ctrl-btn:hover:not(:disabled) {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.04);
}

.ctrl-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ctrl-btn.active {
  color: var(--color-primary);
}

.ctrl-btn.active.shuffle,
.ctrl-btn.active.repeat {
  background: rgba(99, 102, 241, 0.14);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3) inset;
}

.ctrl-btn.active svg {
  filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.5));
}

.ctrl-btn.repeat.repeat-one-mode {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
  box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.4) inset;
}

.ctrl-btn.repeat.repeat-one-mode svg {
  filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.6));
}

.repeat-one-badge,
.repeat-mode-badge {
  position: absolute;
  font-size: 0.5rem;
  font-weight: 800;
  font-family: var(--font-mono);
  pointer-events: none;
  letter-spacing: 0.04em;
  top: 50%;
  left: 50%;
  transform: translate(-25%, 35%);
}

.repeat-one-badge {
  color: #ec4899;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  width: 11px;
  height: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  box-shadow: 0 0 4px rgba(236, 72, 153, 0.5);
}

.repeat-mode-badge {
  color: var(--color-primary);
  font-size: 0.45rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 1px 3px;
  border-radius: 3px;
  box-shadow: 0 0 3px rgba(99, 102, 241, 0.4);
}

/* ===== PLAY/PAUSE SPHERE WITH RIPPLE ===== */
.play-pause-sphere {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(236, 72, 153, 0.35);
  transition: all var(--transition-bounce);
  position: relative;
  overflow: visible;
}

.play-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.7);
  animation: playPulse 1.8s ease-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes playPulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
}

.play-pause-sphere:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.5);
}

.play-pause-sphere:active:not(:disabled) {
  transform: scale(0.94);
}

.play-pause-sphere svg {
  width: 22px;
  height: 22px;
  position: relative;
  z-index: 2;
}

/* Ripple ring effect */
.ripple-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

.ripple-ring.animate {
  animation: rippleExpand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes rippleExpand {
  0% {
    inset: 0;
    opacity: 0.6;
  }
  100% {
    inset: -16px;
    opacity: 0;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: relative;
  z-index: 2;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== ACCESSORIES STRIP ===== */
.accessory-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.accessory-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.accessory-left {
  justify-self: start;
}

.accessory-center {
  justify-self: stretch;
  justify-content: center;
}

.accessory-right {
  justify-self: end;
}

.popover-wrapper {
  position: relative;
}

.acc-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.acc-btn svg {
  width: 16px;
  height: 16px;
}

.acc-btn:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
}

.acc-btn.active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
}

.acc-btn.speed-btn {
  min-width: 44px;
  padding: 0 10px;
}

.speed-label {
  font-size: 0.7rem;
  font-weight: 800;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.sleep-dot {
  width: 5px;
  height: 5px;
  background: var(--color-primary);
  border-radius: 50%;
  position: absolute;
  top: 4px;
  right: 4px;
  box-shadow: 0 0 6px var(--color-primary);
}

.speed-badge {
  font-size: 0.55rem;
  font-weight: 800;
  background: var(--color-primary);
  color: white;
  padding: 1px 3px;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  position: absolute;
  top: 2px;
  right: -2px;
}

/* Popover cards */
.popover-card {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 160px;
  overflow: hidden;
  z-index: 50;
  backdrop-filter: blur(15px);
  animation: popoverIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.speed-card {
  min-width: 100px;
}

.popover-title {
  padding: 10px 14px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--color-border);
}

.popover-option {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.speed-card .popover-option {
  text-align: center;
}

.popover-option:hover {
  background: var(--color-surface-hover);
}

.popover-option.active {
  background: rgba(236, 72, 153, 0.15);
  color: var(--color-primary);
}

.popover-option.cancel {
  color: var(--color-error);
  border-top: 1px solid var(--color-border);
}

@keyframes popoverIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.95); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.12s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
}

/* Volume controls */
.slider-volume {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 200px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.slider-volume:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
}

.mute-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.mute-btn svg {
  width: 14px;
  height: 14px;
}

.mute-btn:hover {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
}

.volume-slider-bar {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
}

.volume-slider-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
  transition: transform var(--transition-fast);
}

.volume-slider-bar::-webkit-slider-thumb:hover {
  transform: scale(1.25);
}

.volume-slider-bar::-moz-range-thumb {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.5);
}

.volume-readout {
  display: flex;
  align-items: baseline;
  gap: 1px;
  min-width: 30px;
  justify-content: flex-end;
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.volume-readout.is-muted {
  color: var(--color-error);
}

.volume-num {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.volume-pct {
  font-size: 0.6rem;
  font-weight: 600;
  opacity: 0.7;
}

/* Error Toast */
.error-toast {
  position: absolute;
  bottom: 24px;
  left: 20px;
  right: 20px;
  background: var(--color-error);
  color: white;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(244, 63, 94, 0.3);
  z-index: 60;
  animation: popoverIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-toast svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.error-toast span {
  flex: 1;
  text-align: left;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== SLIDING TAB INDICATOR ===== */
.tab-switcher {
  position: relative;
  isolation: isolate;
}

.tab-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 3px);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent, #ec4899));
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  z-index: 0;
  transition: transform 0.32s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}

.tab-indicator.right {
  transform: translateX(100%);
}

.tab-btn {
  z-index: 1;
}

.tab-btn.active {
  color: white;
  background: transparent;
  box-shadow: none;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.tab-label {
  transition: opacity 0.2s ease;
}

/* ===== FOCUS RINGS (ACCESSIBILITY) ===== */
button:focus-visible,
.qa-btn:focus-visible,
.acc-btn:focus-visible,
.mute-btn:focus-visible,
.recent-item:focus-visible,
.queue-item:focus-visible,
.timeline:focus-visible,
.track-artist-btn:focus-visible,
.tab-btn:focus-visible,
input[type="range"]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

input[type="range"]:focus-visible {
  outline-offset: 4px;
}

.timeline:focus-visible .timeline-track {
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* ===== VOLUME SLIDER WITH VISIBLE FILL ===== */
.volume-slider-bar {
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-accent, #ec4899) var(--vol, 0%),
    rgba(255, 255, 255, 0.1) var(--vol, 0%),
    rgba(255, 255, 255, 0.1) 100%
  );
}

.volume-slider-bar::-webkit-slider-runnable-track {
  background: transparent;
}

.volume-slider-bar::-moz-range-track {
  background: transparent;
}

.volume-slider-bar::-moz-range-progress {
  background: var(--color-primary);
  height: 4px;
  border-radius: var(--radius-full);
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Large desktop: widen sidebar, larger artwork */
@media (min-width: 1400px) {
  .player-sidebar {
    width: 360px;
  }
  .artwork-frame {
    width: min(100%, 260px);
  }
  .scroll-content {
    padding: 24px 24px;
  }
}

/* Standard desktop (default zone) */
@media (max-width: 1099px) {
  .player-sidebar {
    width: 300px;
  }
}

/* Tablet: compact */
@media (max-width: 900px) {
  .player-sidebar {
    width: 280px;
  }
  .artwork-frame {
    width: min(100%, 190px);
  }
  .scroll-content {
    padding: 16px;
  }
  .track-title {
    font-size: 1.08rem;
  }
  .accessory-controls {
    padding: 0 2px;
  }
  .slider-volume {
    padding: 3px 8px;
  }
}

/* Mobile: full-width drawer */
@media (max-width: 640px) {
  .player-sidebar {
    width: 100vw !important;
    max-width: 100vw !important;
    box-shadow: none;
  }
  .scroll-content {
    padding: 14px 16px;
  }
  .artwork-frame {
    width: min(75%, 220px);
  }
  .tab-label {
    display: none;
  }
  .tab-btn {
    padding: 8px 10px;
  }
  .qa-btn span {
    display: none;
  }
  .qa-btn {
    padding: 10px 6px;
  }
  .timeline-labels {
    font-size: 0.7rem;
  }
  .accessory-controls {
    grid-template-columns: auto 1fr auto;
    gap: 6px;
  }
  .slider-volume {
    padding: 2px 6px;
    gap: 6px;
  }
  .volume-readout {
    min-width: 24px;
  }
  .volume-num {
    font-size: 0.7rem;
  }
  .speed-btn {
    min-width: 36px;
    padding: 0 6px;
  }
  .queue-item {
    grid-template-columns: 18px 40px minmax(0, 1fr) 24px 24px 36px;
    padding: 6px 8px;
    min-height: 52px;
  }
  .recent-item {
    grid-template-columns: 36px minmax(0, 1fr) 24px;
    padding: 5px 6px;
    min-height: 46px;
  }
  .recent-thumb {
    width: 36px;
    height: 36px;
  }
  .queue-thumb-wrap {
    width: 40px;
    height: 40px;
  }
  .queue-thumb {
    width: 40px;
    height: 40px;
  }
  .queue-stats {
    font-size: 0.74rem;
  }
}

/* Very small phones */
@media (max-width: 380px) {
  .player-sidebar {
    font-size: 14px;
  }
  .scroll-content {
    padding: 10px 12px;
    gap: 14px;
  }
  .player-view-pane,
  .queue-view-pane {
    gap: 14px;
  }
  .play-pause-sphere {
    width: 48px;
    height: 48px;
  }
  .ctrl-btn {
    width: 36px;
    height: 36px;
  }
  .quick-actions {
    gap: 4px;
  }
  .qa-btn {
    padding: 8px 4px;
  }
  .slider-volume {
    padding: 2px 4px;
  }
  .volume-pct {
    display: none;
  }
  .acc-btn.speed-btn {
    min-width: 32px;
    padding: 0 4px;
  }
  .hub-empty-title {
    font-size: 0.8rem;
  }
  .hub-empty-sub {
    font-size: 0.68rem;
  }
}

/* High-DPI / large touch targets on coarse pointers */
@media (pointer: coarse) {
  .ctrl-btn,
  .acc-btn,
  .qa-btn,
  .mute-btn,
  .play-pause-sphere {
    min-height: 44px;
    min-width: 44px;
  }
  .play-pause-sphere {
    min-width: 56px;
    min-height: 56px;
  }
  .action-icon-btn {
    min-width: 32px;
    min-height: 32px;
  }
}

/* Reduced motion: respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .play-pulse,
  .ripple-ring,
  .ambient-glow-secondary {
    animation: none !important;
  }
}

/* Print: hide player */
@media print {
  .player-sidebar {
    display: none !important;
  }
}
</style>
