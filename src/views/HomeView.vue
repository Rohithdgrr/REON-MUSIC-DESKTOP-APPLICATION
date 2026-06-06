<template>
  <div class="home">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Discover</h1>
        <p class="page-sub">Your Premium Glassmorphic Soundscape</p>
      </div>
      <div class="header-search-container">
        <div class="header-search" :class="{ focused: isSearchFocused || searchQuery }">
          <svg class="header-search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            @input="handleSearchInput"
            @keyup.enter="performSearch"
            type="text"
            placeholder="Search songs, artists, channels..."
            class="header-search-input"
            ref="searchInput"
          />
          <button v-if="searchQuery" @click="clearSearch" class="search-clear-btn" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <!-- Search Dropdown -->
        <div v-if="showSearchDropdown" class="search-dropdown">
          <div v-if="searchQuery && isSearching" class="search-section">
            <div class="search-loading">
              <div class="search-spinner"></div>
              <span>Querying InnerTube...</span>
            </div>
          </div>
          
          <div v-if="searchQuery && !isSearching && searchResults.length > 0" class="search-section">
            <div class="search-section-header">
              <span>Results found</span>
              <span class="result-count">{{ searchResults.length }} items</span>
            </div>
            <button
              v-for="(result, index) in searchResults.slice(0, 8)"
              :key="result.videoId"
              class="search-result-item"
              :class="{ selected: selectedResultIndex === index }"
              @click="selectResult(result)"
            >
              <img v-if="result.thumbnail && !brokenImages.has(result.thumbnail)" :src="result.thumbnail" @error="handleImageError(result.thumbnail)" class="result-thumb" alt="" loading="lazy" decoding="async" />
              <div v-else class="result-thumb result-thumb-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div class="result-info">
                <span class="result-title">{{ result.title }}</span>
                <span class="result-artist">{{ result.artist }}</span>
              </div>
              <svg class="result-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 1. Hero Spotlight Banner -->
    <div class="hero-banner glass-panel">
      <div class="hero-content">
        <span class="hero-tag">FEATURED SELECTION</span>
        <h2 class="hero-title">Experience Infinite Sound</h2>
        <p class="hero-subtitle">Dive into your personal sqlite library, dynamic live trending list, or play custom mood vectors on the fly.</p>
        <div class="hero-actions">
          <button class="hero-play-btn" @click="playFeaturedMix">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-svg"><path d="M8 5v14l11-7z"/></svg>
            SHUFFLE MIX
          </button>
          <button class="hero-outline-btn" @click="scrollToSection('playlists-section')">
            EXPLORE PLAYLISTS
          </button>
        </div>
      </div>
      <div class="hero-backdrop-glow"></div>
    </div>

    <section class="stats-strip">
      <div class="stat-tile glass-panel">
        <span class="stat-value">{{ statsStore.totalSongs }}</span>
        <span class="stat-label">Tracks</span>
      </div>
      <div class="stat-tile glass-panel">
        <span class="stat-value">{{ playlists.length }}</span>
        <span class="stat-label">Playlists</span>
      </div>
      <div class="stat-tile glass-panel">
        <span class="stat-value">{{ featuredArtists.length }}</span>
        <span class="stat-label">Artists</span>
      </div>
      <div class="stat-tile glass-panel">
        <span class="stat-value">{{ statsStore.totalFavorites }}</span>
        <span class="stat-label">Favorites</span>
      </div>
    </section>

    <!-- 2. Quick Picks / Jump Back In Grid -->
    <section v-if="quickPicks && quickPicks.length > 0" class="home-section quick-picks-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-indigo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <h3>Quick Picks</h3>
        </div>
      </div>
      <div class="quick-picks-grid">
        <div v-for="track in quickPicks" :key="'quick-'+track.videoId" class="quick-pick-card glass-panel animate-on-hover" @click="handlePlay(track)">
          <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" class="quick-pick-thumb" alt="" loading="lazy" decoding="async" />
          <div v-else class="quick-pick-thumb quick-pick-thumb-empty">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div class="quick-pick-info">
            <span class="quick-pick-title">{{ track.title }}</span>
            <span class="quick-pick-artist">{{ track.artist }}</span>
          </div>
          <button class="quick-pick-play-btn" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 3. Curated Genre/Language Pills Tray -->
    <div class="genre-pill-tray-container">
      <div class="genre-pill-tray">
        <button 
          v-for="cat in curatedCategories" 
          :key="cat.id" 
          @click="searchCategory(cat)" 
          class="genre-pill"
        >
          <span class="pill-dot" :style="{ background: cat.gradient }"></span>
          {{ cat.name }}
        </button>
      </div>
      <div class="tray-mask-right"></div>
    </div>

    <!-- 4. Dynamic Trending Songs Grid -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 6l-9.5 9.5-5-5L1 18"/>
              <path d="M17 6h6v6"/>
            </svg>
          </div>
          <h3>Trending Music India</h3>
        </div>
        <button @click="router.push({ name: 'search', query: { q: 'popular trending hits' } })" class="view-all-btn">VIEW ALL</button>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="isLoadingTrending" class="trending-grid">
        <div v-for="n in 8" :key="'sk-'+n" class="skeleton-card glass-panel">
          <div class="skeleton-thumb"></div>
          <div class="skeleton-meta">
            <div class="skeleton-line main"></div>
            <div class="skeleton-line sub"></div>
          </div>
        </div>
      </div>

      <!-- Actual Songs Grid -->
      <div v-else class="trending-grid">
        <TrackCard 
          v-for="track in trendingSongs" 
          :key="'trend-'+track.videoId" 
          :track="track" 
          @play="handlePlay" 
        />
      </div>
    </section>

    <!-- 4b. Top Tracks Chart -->
    <section class="home-section" v-if="chartTracks.length > 0">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19V5"/><path d="M8 19V9"/><path d="M12 19V3"/><path d="M16 19V11"/><path d="M20 19V7"/>
            </svg>
          </div>
          <h3>Top Tracks</h3>
        </div>
        <span class="section-meta">{{ chartSubtitle }}</span>
      </div>

      <div class="chart-list">
        <TrackCard
          v-for="(track, index) in chartTracks"
          :key="'top-'+track.videoId"
          :track="track"
          :index="index + 1"
          @play="handlePlay"
        />
      </div>
    </section>

    <!-- 5. Curated & Smart Playlists Row (SQLite Playlists + Pinia Favorites + Smart Mood Playlists) -->
    <section class="home-section" id="playlists-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h3>Curated & Smart Playlists</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <!-- SQLite Favorites Card -->
          <div class="big-card glass-panel" @click="router.push('/favorites')">
            <div class="big-card-cover fav-gradient">
              <svg class="cover-icon text-red" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">Favorites</span>
            <span class="card-desc">Your highly rated tracks</span>
          </div>

          <!-- User Playlists -->
          <div v-for="pl in playlists" :key="'pl-'+pl.id" class="big-card glass-panel" @click="router.push(`/playlist/${pl.id}`)">
            <div class="big-card-cover pl-gradient">
              <svg class="cover-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ pl.name }}</span>
            <span class="card-desc">Custom SQLite Playlist</span>
          </div>

          <!-- Mood Playlists -->
          <div v-for="(mood, i) in smartPlaylistStore.moodPlaylists" :key="'mood-'+mood.id" class="big-card glass-panel" @click="fetchAndShowMood(mood)">
            <div class="big-card-cover" :style="{ background: moodGradients[i % moodGradients.length] }">
              <div class="mood-emoji">{{ moodEmojis[i % moodEmojis.length] }}</div>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ mood.name }}</span>
            <span class="card-desc">{{ mood.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>

      <div class="scroll-row-container smart-row">
        <div class="scroll-row compact-row">
          <div v-for="(smart, i) in smartPlaylistStore.smartPlaylists" :key="'smart-'+smart.id" class="smart-card glass-panel" @click="openSmartPlaylist(smart)">
            <div class="smart-card-cover" :style="{ background: moodGradients[i % moodGradients.length] }">
              <svg viewBox="0 0 24 24" fill="currentColor" class="smart-card-icon">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ smart.name }}</span>
            <span class="card-desc">{{ smart.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 5b. Regional & Language Playlists -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-indigo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3>Regional & Language Playlists</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <div v-for="cat in curatedCategories" :key="'cat-card-'+cat.id" class="big-card glass-panel" @click="searchCategory(cat)">
            <div class="big-card-cover" :style="{ background: cat.gradient }">
              <img v-if="cat.thumbnail && !brokenImages.has(cat.thumbnail)" :src="cat.thumbnail" @error="handleImageError(cat.thumbnail)" class="cover-thumb" alt="" loading="lazy" decoding="async" />
              <div class="cover-overlay"></div>
              <svg v-if="!cat.thumbnail || brokenImages.has(cat.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ cat.name }}</span>
            <span class="card-desc">{{ cat.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 6. National Top Charts -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
              <line x1="15" y1="21" x2="15" y2="15"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
            </svg>
          </div>
          <h3>Top India Charts</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <div v-for="track in bestTracks" :key="'chart-'+track.id" class="big-card glass-panel" @click="searchCategory(track)">
            <div class="big-card-cover" :style="{ background: track.gradient }">
              <img v-if="track.thumbnail && !brokenImages.has(track.thumbnail)" :src="track.thumbnail" @error="handleImageError(track.thumbnail)" class="cover-thumb" alt="" loading="lazy" decoding="async" />
              <div class="cover-overlay"></div>
              <svg v-if="!track.thumbnail || brokenImages.has(track.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ track.name }}</span>
            <span class="card-desc">{{ track.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 7. Global Top Charts -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <h3>Global Top Charts</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <div v-for="gchart in globalCharts" :key="'gchart-'+gchart.id" class="big-card glass-panel" @click="searchCategory(gchart)">
            <div class="big-card-cover" :style="{ background: gchart.gradient }">
              <img v-if="gchart.thumbnail && !brokenImages.has(gchart.thumbnail)" :src="gchart.thumbnail" @error="handleImageError(gchart.thumbnail)" class="cover-thumb" alt="" loading="lazy" decoding="async" />
              <div class="cover-overlay"></div>
              <svg v-if="!gchart.thumbnail || brokenImages.has(gchart.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ gchart.name }}</span>
            <span class="card-desc">{{ gchart.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 8. Featured Albums & EPs -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-pink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9"/>
              <path d="M3 19h18"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
          <h3>Featured Albums & EPs</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <div v-for="album in featuredAlbums" :key="'album-'+album.id" class="big-card glass-panel" @click="searchCategory(album)">
            <div class="big-card-cover" :style="{ background: album.gradient }">
              <img v-if="album.thumbnail && !brokenImages.has(album.thumbnail)" :src="album.thumbnail" @error="handleImageError(album.thumbnail)" class="cover-thumb" alt="" loading="lazy" decoding="async" />
              <div class="cover-overlay"></div>
              <svg v-if="!album.thumbnail || brokenImages.has(album.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ album.name }}</span>
            <span class="card-desc">{{ album.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 9. Popular Artists Circular Tray -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Popular Artists</h3>
        </div>
      </div>

      <div class="artists-tray-container">
        <div class="artists-tray">
          <div v-for="artist in featuredArtists" :key="'art-'+artist.id" class="artist-circle-card" @click="searchCategory(artist)">
            <div class="artist-avatar-wrapper">
              <img v-if="artist.thumbnail && !brokenImages.has(artist.thumbnail)" :src="artist.thumbnail" @error="handleImageError(artist.thumbnail)" class="artist-avatar" alt="" loading="lazy" decoding="async" />
              <div v-else class="artist-avatar-empty" :style="{ background: artist.gradient }">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
            <span class="artist-name">{{ artist.name }}</span>
            <span class="artist-count" v-if="artist.playCount">{{ artist.playCount }} plays</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- 10. Nostalgia Hits -->
    <section class="home-section">
      <div class="section-header">
        <div class="section-title-grp">
          <div class="card-icon text-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <h3>Nostalgia Hits</h3>
        </div>
      </div>

      <div class="scroll-row-container">
        <div class="scroll-row">
          <div v-for="retro in nostalgiaHits" :key="'retro-'+retro.id" class="big-card glass-panel" @click="searchCategory(retro)">
            <div class="big-card-cover" :style="{ background: retro.gradient }">
              <img v-if="retro.thumbnail && !brokenImages.has(retro.thumbnail)" :src="retro.thumbnail" @error="handleImageError(retro.thumbnail)" class="cover-thumb" alt="" loading="lazy" decoding="async" />
              <div class="cover-overlay"></div>
              <svg v-if="!retro.thumbnail || brokenImages.has(retro.thumbnail)" class="cover-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
            <span class="card-label">{{ retro.name }}</span>
            <span class="card-desc">{{ retro.description }}</span>
          </div>
        </div>
        <div class="tray-mask-right"></div>
      </div>
    </section>

    <!-- Mood Results Modal Overlay -->
    <Transition name="panel-slide">
      <div v-if="activeMood && moodTracks.length > 0" class="mood-panel">
        <div class="mood-panel-header">
          <div>
            <h3 class="mood-panel-title">{{ activeMood.name }}</h3>
            <p class="mood-panel-desc">{{ moodTracks.length }} tracks available</p>
          </div>
          <button @click="closeMoodPanel" class="mood-panel-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="mood-panel-tracks">
          <TrackCard v-for="track in moodTracks" :key="'moodt-'+track.videoId" :track="track" @play="handleMoodPlay" />
        </div>
      </div>
    </Transition>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useStatsStore } from '../stores/stats.js'
import { storeToRefs } from 'pinia'
import TrackCard from '../components/TrackCard.vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { filterMusicContent } from '../utils/contentFilter.js'
import { useSmartPlaylistsStore } from '../stores/smartPlaylists.js'
import { useNotifications } from '../composables/useNotifications.js'

const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()
const favStore = useFavoritesStore()
const statsStore = useStatsStore()
const smartPlaylistStore = useSmartPlaylistsStore()
const { showNotification } = useNotifications()

const { history, playlists } = storeToRefs(library)
const { topSongs, topArtists } = storeToRefs(statsStore)

// Dynamic Trending Songs lists
const trendingSongs = ref([])
const isLoadingTrending = ref(false)
const statsReady = ref(false)

const artistThumbCache = ref({})

// Quick Picks helper
const quickPicks = computed(() => {
  const list = []
  const seen = new Set()
  
  if (history.value && history.value.length > 0) {
    for (const item of history.value) {
      const videoId = item.video_id || item.videoId
      if (videoId && !seen.has(videoId)) {
        seen.add(videoId)
        list.push({
          videoId,
          title: item.title,
          artist: item.artist,
          thumbnail: item.thumbnail_url || item.thumbnail,
          duration: item.duration_seconds || item.duration
        })
      }
      if (list.length >= 6) break
    }
  }
  
  if (list.length < 6 && trendingSongs.value && trendingSongs.value.length > 0) {
    for (const track of trendingSongs.value) {
      if (!seen.has(track.videoId)) {
        seen.add(track.videoId)
        list.push(track)
      }
      if (list.length >= 6) break
    }
  }
  
  return list
})

const chartTracks = computed(() => {
  const source = topSongs.value.length > 0 ? topSongs.value : trendingSongs.value
  return source.slice(0, 8)
})

const chartSubtitle = computed(() => topSongs.value.length > 0 ? 'Most played in your library' : 'Trending right now')

const featuredArtists = computed(() => {
  const fallbackList = artists.value
  const lookup = new Map(fallbackList.map(artist => [artist.name, artist]))
  const source = topArtists.value.length > 0 ? topArtists.value : fallbackList

  return source.slice(0, 8).map((artist, index) => {
    const base = lookup.get(artist.name) || artist
    return {
      ...base,
      id: base.id || artist.name,
      name: artist.name,
      query: base.query || `${artist.name} songs`,
      gradient: base.gradient || moodGradients[index % moodGradients.length],
      thumbnail: artistThumbCache.value[artist.name] || base.thumbnail || null,
      playCount: artist.playCount || base.playCount || 0
    }
  })
})

// Mood settings
const activeMood = ref(null)
const moodTracks = ref([])
const moodGradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)'
]
const moodEmojis = ['💪', '🎯', '😎', '🎉', '💕']

// Curated Category Lists
const imageThumbs = {
  concert: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  guitar: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
  stage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80',
  crowd: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
  dj: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
}

const curatedCategories = [
  { id: 'hindi-songs', name: 'Hindi Hits', description: 'Popular Hindi music', query: 'hindi songs 2024', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', tag: 'Hindi', thumbnail: imageThumbs.guitar },
  { id: 'telugu-songs', name: 'Telugu Beats', description: 'Latest Telugu hits', query: 'telugu songs 2024', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', tag: 'Telugu', thumbnail: imageThumbs.stage },
  { id: 'indian-songs', name: 'Indian Vibes', description: 'Best of Indian music', query: 'indian songs popular', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)', tag: 'Hindi', thumbnail: imageThumbs.concert },
  { id: 'love-songs', name: 'Love Songs', description: 'Romantic melodies', query: 'love songs romantic', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', tag: 'Hindi', thumbnail: imageThumbs.headphones },
  { id: 'tamil-songs', name: 'Tamil Waves', description: 'Tamil music collection', query: 'tamil songs 2024', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', tag: 'Tamil', thumbnail: imageThumbs.crowd },
  { id: 'punjabi-songs', name: 'Punjabi Fire', description: 'Energetic Punjabi beats', query: 'punjabi songs 2024', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', tag: 'Punjabi', thumbnail: imageThumbs.dj },
  { id: 'kannada-songs', name: 'Kannada Hits', description: 'Beautiful Kannada music', query: 'kannada songs 2024', gradient: 'linear-gradient(135deg, #10b981, #059669)', tag: 'Kannada', thumbnail: null },
  { id: 'malayalam-songs', name: 'Malayalam Hits', description: 'Soothing Malayalam tracks', query: 'malayalam songs 2024', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', tag: 'Malayalam', thumbnail: null },
  { id: 'bengali-songs', name: 'Bengali Classics', description: 'Golden Bengali collection', query: 'bengali songs hits', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', tag: 'Bengali', thumbnail: null },
  { id: 'bhojpuri-songs', name: 'Bhojpuri Hits', description: 'Energetic Bhojpuri music', query: 'bhojpuri hit songs 2024', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', tag: 'Bhojpuri', thumbnail: null }
]

const bestTracks = ref([
  { id: 'top-50', name: 'Top 50 India', description: 'Most streamed in India', query: 'top 50 india songs', gradient: 'linear-gradient(135deg, #f97316, #b91c1c)', thumbnail: null },
  { id: 'trending', name: 'Trending Now', description: 'What\'s hot in India', query: 'trending songs india 2025 2026', gradient: 'linear-gradient(135deg, #fbbf24, #ea580c)', thumbnail: null },
  { id: 'new-releases', name: 'New Releases', description: 'Fresh music releases', query: 'new hindi songs 2026 latest', gradient: 'linear-gradient(135deg, #f59e0b, #dc2626)', thumbnail: null }
])

const globalCharts = ref([
  { id: 'global-50', name: 'Global Top 50', description: 'Most popular worldwide', query: 'global top 50 songs playlist hits', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', thumbnail: null },
  { id: 'billboard-100', name: 'Billboard Hot 100', description: 'Weekly chart toppers', query: 'billboard hot 100 songs list', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', thumbnail: null },
  { id: 'viral-hits', name: 'Viral Hits Global', description: 'Trending songs globally', query: 'viral hits global tiktok trend songs', gradient: 'linear-gradient(135deg, #10b981, #047857)', thumbnail: null }
])

const featuredAlbums = ref([
  { id: 'album-lofi', name: 'Lofi Chill Study Beats', description: 'Calm ambient lofi mixes', query: 'lofi study beats chill instrumental lofi hip hop', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', thumbnail: null },
  { id: 'album-bollywood', name: 'Ultimate Bollywood Jukebox', description: 'Nostalgic modern audio collection', query: 'best hindi audio jukebox songs non stop', gradient: 'linear-gradient(135deg, #ec4899, #be185d)', thumbnail: null },
  { id: 'album-acoustic', name: 'Unplugged Session EPs', description: 'Soothing acoustic versions', query: 'unplugged session songs acoustic cover acoustic unplugged', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', thumbnail: null }
])

const nostalgiaHits = ref([
  { id: '90s-gold', name: '90s Bollywood Gold', description: 'Golden era classics', query: '90s hindi evergreen hit songs audio jukebox', gradient: 'linear-gradient(135deg, #ef4444, #991b1b)', thumbnail: null },
  { id: '2000s-melodies', name: '2000s Love Anthems', description: 'Romantic melodies of 2000s', query: '2000s hindi love songs playlist romantic', gradient: 'linear-gradient(135deg, #fb7185, #db2777)', thumbnail: null },
  { id: 'synth-retro', name: '80s Synth Pop Classics', description: 'Vibrant vintage beats', query: '80s synth pop hits retro synthwave pop', gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)', thumbnail: null }
])

const artists = ref([
  { id: 'arijit', name: 'Arijit Singh', query: 'arijit singh songs playlist popular', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', thumbnail: null },
  { id: 'shreya', name: 'Shreya Ghoshal', query: 'shreya ghoshal songs playlist hits', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', thumbnail: null },
  { id: 'atif', name: 'Atif Aslam', query: 'atif aslam songs playlist hit tracks', gradient: 'linear-gradient(135deg, #fb923c, #dc2626)', thumbnail: null },
  { id: 'diljit', name: 'Diljit Dosanjh', query: 'diljit dosanjh songs popular hits', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', thumbnail: null },
  { id: 'rahman', name: 'A.R. Rahman', query: 'ar rahman hits best collection', gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)', thumbnail: null },
  { id: 'anirudh', name: 'Anirudh Ravichander', query: 'anirudh ravichander songs hits playlist', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', thumbnail: null },
  { id: 'taylor', name: 'Taylor Swift', query: 'taylor swift popular hits best playlist', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', thumbnail: null },
  { id: 'weeknd', name: 'The Weeknd', query: 'the weeknd popular hits after hours starboy', gradient: 'linear-gradient(135deg, #10b981, #059669)', thumbnail: null }
])

// Search bar states
const searchQuery = ref('')
const isSearchFocused = ref(false)
const showSearchDropdown = ref(false)
const isSearching = ref(false)
const searchResults = ref([])
const selectedResultIndex = ref(-1)
const searchInput = ref(null)
let searchTimeout = null

const brokenImages = ref(new Set())
function handleImageError(url) {
  if (url) brokenImages.value.add(url)
}

// Fetch live trending songs from InnerTube
async function fetchTrendingSongs() {
  isLoadingTrending.value = true
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const result = await electron.innertube.search('trending music india popular hits 2025 2026', { type: 'video' })
    if (result.success && result.data && Array.isArray(result.data)) {
      const musicOnly = filterMusicContent(result.data)
      trendingSongs.value = musicOnly.slice(0, 8).map(item => {
        const videoId = item.id || item.videoId
        const title = item.title || 'Unknown Title'
        const artist = item.author || item.artist || 'Unknown Artist'
        const thumbnail = item.thumbnails?.[0]?.url || item.thumbnail || ''
        const duration = item.duration || 0
        return { videoId, title, artist, thumbnail, duration }
      }).filter(item => item.videoId)
    }
  } catch (err) {
    console.error('Failed to fetch trending songs:', err)
  } finally {
    isLoadingTrending.value = false
  }
}

// Featured play/shuffle action
function playFeaturedMix() {
  if (trendingSongs.value.length > 0) {
    const shuffled = [...trendingSongs.value].sort(() => Math.random() - 0.5)
    player.setQueue(shuffled, 0)
    player.playTrack(shuffled[0])
    showNotification({ title: 'Playing Trending Mix', type: 'success' })
  } else if (history.value.length > 0) {
    const normalHistory = history.value.map(item => ({
      videoId: item.video_id,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail_url,
      duration: item.duration_seconds
    }))
    const shuffled = [...normalHistory].sort(() => Math.random() - 0.5)
    player.setQueue(shuffled, 0)
    player.playTrack(shuffled[0])
    showNotification({ title: 'Playing Shuffled History Mix', type: 'success' })
  } else {
    showNotification({ title: 'Add tracks to library to shuffle', type: 'info' })
  }
}

// Scroll support
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// Load static card thumbnails
async function loadThumbnails() {
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const fetchThumb = async (item) => {
      try {
        const result = await electron.innertube.search(item.query, { type: 'video' })
        if (result.success && result.data && result.data.length > 0) {
          const musicResults = filterMusicContent(result.data)
          if (musicResults.length > 0) {
            item.thumbnail = musicResults[0].thumbnails?.[0]?.url || musicResults[0].thumbnail || null
          }
        }
      } catch (e) {
        console.error('Failed to load thumb for', item.name, e)
      }
    }

    const tasks = [
      ...bestTracks.value.map(fetchThumb),
      ...globalCharts.value.map(fetchThumb),
      ...featuredAlbums.value.map(fetchThumb),
      ...nostalgiaHits.value.map(fetchThumb),
      ...artists.value.map(fetchThumb),
      ...curatedCategories.filter(c => !c.thumbnail).map(fetchThumb)
    ]
    
    await Promise.all(tasks)
  } catch (err) {
    console.error('Failed to load thumbnails:', err)
  }
}

async function loadArtistThumbnails() {
  try {
    await waitForElectronApi()
    const electron = getElectronApi()

    const targets = featuredArtists.value.filter(artist => !artist.thumbnail)
    const results = await Promise.all(targets.map(async artist => {
      try {
        const response = await electron.innertube.search(`${artist.name} songs`, { type: 'video' })
        const items = response.success && Array.isArray(response.data) ? filterMusicContent(response.data) : []
        return {
          name: artist.name,
          thumbnail: items[0]?.thumbnails?.[0]?.url || items[0]?.thumbnail || null
        }
      } catch (err) {
        return { name: artist.name, thumbnail: null }
      }
    }))

    const nextCache = { ...artistThumbCache.value }
    for (const item of results) {
      if (item.thumbnail) {
        nextCache[item.name] = item.thumbnail
      }
    }
    artistThumbCache.value = nextCache
  } catch (err) {
    console.error('Failed to load artist thumbnails:', err)
  }
}

onMounted(async () => {
  await Promise.all([
    library.loadSongs(), 
    library.loadHistory(), 
    library.loadPlaylists(), 
    favStore.loadFavorites(),
    statsStore.loadStats(),
    loadThumbnails(),
    fetchTrendingSongs()
  ])

  statsReady.value = true
  await loadArtistThumbnails()
})

function handlePlay(track) { 
  player.setQueue([track], 0)
  player.playTrack(track) 
}

function searchCategory(c) { 
  router.push({
    path: `/category/${c.id}`,
    query: {
      q: c.query,
      name: c.name,
      desc: c.description || (c.name + ' selection'),
      grad: c.gradient
    }
  })
}

// Mood Playlists
async function fetchAndShowMood(mood) {
  activeMood.value = mood
  const tracks = await smartPlaylistStore.fetchMoodPlaylist(mood.id)
  moodTracks.value = tracks
}

function closeMoodPanel() {
  activeMood.value = null
  moodTracks.value = []
}

function handleMoodPlay(track) {
  if (moodTracks.value.length > 0) {
    player.setQueue(moodTracks.value, moodTracks.value.findIndex(t => t.videoId === track.videoId))
    player.playTrack(track)
  }
}

function openSmartPlaylist(playlist) {
  const tracks = smartPlaylistStore.generatePlaylist(playlist.id)
  if (!tracks.length) {
    showNotification({ title: 'No songs yet', message: playlist.description, type: 'info' })
    return
  }

  player.setQueue(tracks, 0)
  player.playTrack(tracks[0])
  showNotification({ title: `Playing ${playlist.name}`, message: `${tracks.length} songs queued`, type: 'success' })
}

// Live search setups
watch([isSearchFocused, searchQuery], ([focused, query]) => {
  showSearchDropdown.value = focused || query.length > 0
})

function handleSearchInput() {
  selectedResultIndex.value = -1
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    await performLiveSearch()
  }, 500)
}

async function performLiveSearch() {
  if (!searchQuery.value.trim()) {
    isSearching.value = false
    return
  }
  try {
    await waitForElectronApi()
    const electron = getElectronApi()
    
    const result = await electron.innertube.search(searchQuery.value.trim(), { type: 'video' })
    if (result.success && result.data && Array.isArray(result.data)) {
      const musicOnly = filterMusicContent(result.data)
      searchResults.value = musicOnly.slice(0, 20).map(item => {
        const videoId = item.id || item.videoId
        const title = item.title || 'Unknown Title'
        const artist = item.author || item.artist || 'Unknown Artist'
        const thumbnail = item.thumbnails?.[0]?.url || item.thumbnail || ''
        const duration = item.duration || 0
        return { videoId, title, artist, thumbnail, duration }
      }).filter(item => item.videoId)
    } else {
      searchResults.value = []
    }
  } catch (err) {
    console.error('Search error:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function performSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
  clearSearch()
}

async function selectResult(result) {
  try {
    if (!result || !result.videoId) return
    const track = {
      videoId: result.videoId,
      title: result.title || 'Unknown Title',
      artist: result.artist || 'Unknown Artist',
      thumbnail: result.thumbnail || '',
      duration: result.duration || 0
    }
    player.setQueue([track], 0)
    await player.playTrack(track)
    clearSearch()
  } catch (err) {
    console.error('Error playing track from search:', err)
  }
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  isSearchFocused.value = false
  showSearchDropdown.value = false
  selectedResultIndex.value = -1
  if (searchInput.value) searchInput.value.blur()
}

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false
    showSearchDropdown.value = false
  }, 200)
}
</script>

<style scoped>
.home { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 40px 0;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Page Header */
.page-header { 
  margin-bottom: 32px; 
  padding-bottom: 16px; 
  border-bottom: 1px solid var(--color-border); 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 16px; 
}
.page-title { 
  font-size: 2.4rem; 
  font-weight: 800; 
  color: var(--color-text); 
  letter-spacing: -1px; 
  margin: 0;
}
.page-sub { 
  font-size: 11px; 
  color: var(--color-primary); 
  margin-top: 4px; 
  font-weight: 800; 
  text-transform: uppercase; 
  letter-spacing: 1.5px; 
}

/* Search bar */
.header-search-container {
  position: relative;
  width: clamp(200px, 30%, 400px);
  flex-shrink: 1;
  min-width: 0;
}
.header-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.header-search.focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  background: var(--color-surface-elevated);
}
.header-search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}
.header-search-input {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 13px;
  outline: none;
  width: 100%;
}
.search-clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
}
.search-clear-btn svg {
  width: 14px;
  height: 14px;
}
.search-clear-btn:hover {
  color: var(--color-text);
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  margin-top: 8px;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: var(--color-text-secondary);
  font-size: 13px;
}
.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.search-section-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.search-result-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 14px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border-light);
}
.search-result-item:hover {
  background: var(--color-surface-hover);
}
.result-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}
.result-thumb-empty {
  background: var(--color-surface-active);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}
.result-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.result-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-artist {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-play-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-fast);
}
.search-result-item:hover .result-play-icon {
  opacity: 1;
  transform: scale(1);
}

/* 1. Frosted Glass Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%), var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 48px;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}
.hero-tag {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 2px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin: 0 0 14px 0;
}
.hero-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 28px 0;
}
.hero-actions {
  display: flex;
  gap: 16px;
}
.hero-play-btn {
  background: var(--color-primary);
  border: none;
  color: white;
  padding: 14px 28px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.35);
}
.hero-play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.45);
  background: var(--color-primary-light);
}
.hero-play-btn:active {
  transform: translateY(0);
}
.btn-svg {
  width: 14px;
  height: 14px;
}
.hero-outline-btn {
  background: transparent;
  border: 1px solid var(--color-border-light);
  color: var(--color-text);
  padding: 14px 28px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.hero-outline-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-text);
}
.hero-backdrop-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

/* Compact stats strip */
.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-tile {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* 2. Curated Genre Pills */
.genre-pill-tray {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 16px 0;
  margin-bottom: 24px;
}
.genre-pill-tray::-webkit-scrollbar {
  display: none;
}
.genre-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.genre-pill:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: scale(1.03);
  border-color: var(--glass-border-hover);
}
.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 3. Sections Structure */
.home-section {
  margin-top: 40px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title-grp {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-icon svg {
  width: 14px;
  height: 14px;
}
.card-icon.text-green { color: var(--color-success, #10b981); }
.card-icon.text-purple { color: var(--color-primary, #ec4899); }
.card-icon.text-orange { color: var(--color-warning, #f59e0b); }
.card-icon.text-blue { color: var(--color-accent, #6366f1); }

.section-header h3 {
  font-size: 16px;
  font-weight: 850;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.4px;
}

.section-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.view-all-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.view-all-btn:hover {
  color: var(--color-primary-light);
  letter-spacing: 2px;
}

/* 4. Trending Grid Layout */
.trending-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 0 2px;
}

/* Skeletons */
.skeleton-card {
  height: 64px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  position: relative;
  overflow: hidden;
}
.skeleton-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
  transform: translateX(-100%);
  animation: loading-shimmer 1.6s infinite;
}
.skeleton-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: var(--color-border-light);
}
.skeleton-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.skeleton-line {
  height: 8px;
  border-radius: 4px;
  background: var(--color-border-light);
}
.skeleton-line.main {
  width: 60%;
}
.skeleton-line.sub {
  width: 40%;
}

@keyframes loading-shimmer {
  to { transform: translateX(100%); }
}

/* 5. Playlists / Charts Rows Scroll elements */
.scroll-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 0 16px 0;
}
.scroll-row::-webkit-scrollbar {
  display: none;
}

/* Playlists covers custom cards */
.big-card {
  width: 172px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.smart-card {
  width: 172px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.smart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--glass-border-hover);
}

.smart-card-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.smart-card-icon {
  width: 42px;
  height: 42px;
  color: rgba(255, 255, 255, 0.42);
}

.smart-row {
  margin-top: 16px;
}

.compact-row {
  padding-bottom: 8px;
}
.big-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--glass-border-hover);
}
.big-card-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fav-gradient {
  background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
}
.pl-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
}
.cover-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.big-card:hover .cover-thumb {
  transform: scale(1.05);
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.4) 100%);
  opacity: 0.8;
}
.cover-icon {
  width: 42px;
  height: 42px;
  color: rgba(255,255,255,0.4);
}
.card-play {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(236, 72, 153, 0.4);
}
.card-play svg {
  width: 16px;
  height: 16px;
  margin-left: 2px;
}
.big-card:hover .card-play {
  opacity: 1;
  transform: translateY(0);
}
.card-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-desc {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mood-emoji {
  font-size: 40px;
  z-index: 1;
}

/* 6. Popular Artists Tray */
.artists-tray {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 8px 0 16px 0;
}
.artists-tray::-webkit-scrollbar {
  display: none;
}
.artist-circle-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
  width: 110px;
}
.artist-avatar-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  background: var(--color-surface);
}
.artist-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.artist-avatar-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
}
.artist-avatar-empty svg {
  width: 32px;
  height: 32px;
}
.artist-circle-card:hover .artist-avatar-wrapper {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
.artist-circle-card:hover .artist-avatar {
  transform: scale(1.05);
}
.artist-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.artist-count {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 4px;
}

/* Mood Panel modal styles */
.mood-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 420px;
  height: calc(100vh - 90px);
  background: var(--color-surface-elevated);
  border-left: 1px solid var(--color-border);
  z-index: 40;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: var(--shadow-xl);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.mood-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.mood-panel-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}
.mood-panel-desc {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 2px 0 0 0;
}
.mood-panel-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}
.mood-panel-close svg {
  width: 18px;
  height: 18px;
}
.mood-panel-close:hover {
  color: var(--color-text);
}
.mood-panel-tracks {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}


.bottom-spacer { height: 100px; }

@media (max-width: 1024px) {
  .trending-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .hero-banner {
    padding: 32px;
  }
  .hero-title {
    font-size: 2.2rem;
  }
  .stats-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .page-header { flex-direction: column; align-items: stretch; gap: 12px; }
  .header-search-container { width: 100%; }
}

/* === Responsive additions === */
@media (max-width: 480px) {
  .page-title { font-size: 1.8rem; letter-spacing: -0.5px; }
  .page-sub { font-size: 10px; }
  .hero-banner { padding: 24px; border-radius: 16px; }
  .hero-title { font-size: 1.6rem; }
  .hero-subtitle { font-size: 12px; }
  .hero-actions { flex-direction: column; gap: 10px; }
  .hero-play-btn, .hero-outline-btn { width: 100%; justify-content: center; }
  .stats-strip { gap: 8px; }
  .stat-tile { padding: 10px 12px; }
  .stat-value { font-size: 1rem; }
  .stat-label { font-size: 0.6rem; }
  .section-title-grp h3 { font-size: 14px; }
}

@media (max-width: 380px) {
  .home { padding: 0 4px; }
  .hero-banner { padding: 18px; }
  .hero-title { font-size: 1.4rem; }
  .stat-value { font-size: 0.9rem; }
  .stat-label { font-size: 0.55rem; }
}

@media (min-width: 1400px) {
  .trending-grid { grid-template-columns: repeat(3, 1fr); }
  .home { max-width: 1600px; margin: 0 auto; }
}

@media (min-width: 1700px) {
  .trending-grid { grid-template-columns: repeat(4, 1fr); }
  .home { max-width: 1700px; }
}

/* Quick Picks / Recently Played Grid */
.quick-picks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 1024px) {
  .quick-picks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .quick-picks-grid {
    grid-template-columns: 1fr;
  }
}
.quick-pick-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  gap: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  text-align: left;
}
.quick-pick-card:hover {
  transform: translateY(-2px);
  background: var(--color-surface-hover);
  border-color: var(--glass-border-hover);
  box-shadow: var(--shadow-md);
}
.quick-pick-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.quick-pick-thumb-empty {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: var(--color-surface-active);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.quick-pick-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.quick-pick-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}
.quick-pick-artist {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.quick-pick-play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-fast);
  margin-left: auto;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(236, 72, 153, 0.3);
  cursor: pointer;
}
.quick-pick-play-btn svg {
  width: 14px;
  height: 14px;
  margin-left: 1px;
}
.quick-pick-card:hover .quick-pick-play-btn {
  opacity: 1;
  transform: scale(1);
}

/* Scroll Containers and Masques */
.scroll-row-container, .genre-pill-tray-container, .artists-tray-container {
  position: relative;
  width: 100%;
}
.tray-mask-right {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 60px;
  background: linear-gradient(90deg, transparent, var(--color-background, #0b0f19));
  pointer-events: none;
  z-index: 5;
}

/* Accent text colors */
.card-icon.text-indigo { color: #6366f1; }
.card-icon.text-cyan { color: #06b6d4; }
.card-icon.text-pink { color: #ec4899; }
.card-icon.text-gold { color: #eab308; }
</style>
