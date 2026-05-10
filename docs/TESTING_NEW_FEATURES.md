# Testing Guide - New Features

## 🧪 Testing Checklist for New Features

This guide helps you test all 9 newly implemented features.

---

## 1. ✅ 10-Band Equalizer

### Test Steps:
1. **Start the app** and play any song
2. **Locate EQ button** in player bar (icon with 3 vertical bars)
3. **Click EQ button** - popup should appear
4. **Test presets**:
   - Select "Rock" - should adjust bands
   - Select "Bass Boost" - bass frequencies should increase
   - Select "Flat" - all bands should reset to 0
5. **Test custom EQ**:
   - Drag any slider up/down
   - Preset should change to "Custom"
   - Gain value should update
6. **Test enable/disable**:
   - Uncheck "Enable EQ" - EQ should bypass
   - Check "Enable EQ" - EQ should apply
7. **Test reset**:
   - Adjust some bands
   - Click "Reset" - should return to flat
8. **Test close**:
   - Click outside popup - should close
   - Click X button - should close

### Expected Results:
- ✅ Popup opens smoothly
- ✅ Presets change band values
- ✅ Custom adjustments work
- ✅ Enable/disable toggles effect
- ✅ Reset returns to flat
- ✅ Popup closes properly
- ✅ EQ button shows active state when enabled

---

## 2. ✅ Crossfade Transitions

### Test Steps:
1. **Enable crossfade** in settings (if available)
2. **Play a song** and let it reach near the end
3. **Observe transition** to next song
4. **Listen for**:
   - Current song fading out
   - Next song fading in
   - Smooth overlap (no silence)
5. **Test with skip**:
   - Click "Next" button
   - Should crossfade to next track

### Expected Results:
- ✅ Songs fade out smoothly
- ✅ Next song fades in simultaneously
- ✅ No silence between tracks
- ✅ 3-second transition (default)
- ✅ Works with auto-play and manual skip

---

## 3. ✅ Gapless Playback

### Test Steps:
1. **Enable gapless** in settings (if available)
2. **Play a song** and let it reach the end
3. **Observe transition** to next song
4. **Listen for**:
   - Zero silence between tracks
   - Instant switch
   - No loading delay
5. **Test with album**:
   - Play multiple songs in sequence
   - Should flow seamlessly

### Expected Results:
- ✅ No silence between tracks
- ✅ Instant transitions
- ✅ No loading indicators
- ✅ Perfect for albums
- ✅ Next track preloads in background

---

## 4. ✅ Smart Search Filters

### Test Steps:
1. **Go to Search page**
2. **Enter a search query** (e.g., "rock music")
3. **Click filter button** (icon with 3 horizontal lines)
4. **Test duration filter**:
   - Select "Short (< 4 min)"
   - Results should update
   - Only short songs should show
5. **Test sort options**:
   - Select "View Count"
   - Results should reorder
6. **Test type filter**:
   - Select "Songs"
   - Should filter by type
7. **Test reset**:
   - Click "Reset Filters"
   - All filters should clear
8. **Test filter indicator**:
   - Apply any filter
   - Filter button should highlight

### Expected Results:
- ✅ Filter panel slides in/out smoothly
- ✅ Duration filter works correctly
- ✅ Sort options reorder results
- ✅ Type filter applies
- ✅ Reset clears all filters
- ✅ Results count updates
- ✅ Filter button shows active state

---

## 5. ✅ Smart Playlists

### Test Steps:
1. **Go to Library page**
2. **Look for Smart Playlists section**
3. **Test "Recently Added"**:
   - Should show songs from last 7 days
   - Add a new song
   - Should appear in playlist
4. **Test "Most Played"**:
   - Should show top 50 songs
   - Play a song multiple times
   - Should move up in ranking
5. **Test "Favorites Mix"**:
   - Should show all favorited songs
   - Add/remove favorites
   - Playlist should update
6. **Test "Long Songs"**:
   - Should only show songs > 5 minutes
7. **Test "Short Songs"**:
   - Should only show songs < 3 minutes

### Expected Results:
- ✅ All 5 smart playlists appear
- ✅ Playlists auto-generate correctly
- ✅ Rules filter songs properly
- ✅ Playlists update in real-time
- ✅ Icons display correctly
- ✅ Descriptions are clear

---

## 6. ✅ Song Radio

### Test Steps:
1. **Find any song** in library or search
2. **Right-click song** (or use menu)
3. **Select "Start Radio"**
4. **Wait for loading**
5. **Verify results**:
   - Should show 20+ similar songs
   - Songs should be related to seed
   - No duplicates
6. **Test playback**:
   - Play radio playlist
   - Should play continuously
7. **Test caching**:
   - Start same radio again
   - Should load faster (cached)

### Expected Results:
- ✅ Radio generates successfully
- ✅ Similar songs are relevant
- ✅ No duplicate songs
- ✅ 20+ songs returned
- ✅ Results are shuffled
- ✅ Cache improves performance
- ✅ Playback works smoothly

---

## 7. ✅ System Tray Integration

### Test Steps:
1. **Start the app**
2. **Locate tray icon** in system tray (bottom-right on Windows)
3. **Test left-click**:
   - Click icon
   - Window should hide
   - Click again
   - Window should show
4. **Test right-click menu**:
   - Right-click icon
   - Menu should appear
5. **Test "Show Music Reon"**:
   - Select from menu
   - Window should show and focus
6. **Test "Play/Pause"**:
   - Play a song
   - Select "Play/Pause" from tray
   - Should pause
   - Select again
   - Should play
7. **Test "Next Track"**:
   - Select from menu
   - Should skip to next song
8. **Test "Previous Track"**:
   - Select from menu
   - Should go to previous song
9. **Test "Quit"**:
   - Select from menu
   - App should close completely
10. **Test minimize to tray**:
    - Close window (X button)
    - App should minimize to tray
    - Should not quit

### Expected Results:
- ✅ Tray icon appears on start
- ✅ Left-click toggles window
- ✅ Right-click shows menu
- ✅ All menu items work
- ✅ Play/Pause controls playback
- ✅ Next/Previous skip tracks
- ✅ Quit exits app
- ✅ Close minimizes to tray
- ✅ Tooltip shows "Music Reon"

---

## 🔍 Integration Testing

### Test Feature Combinations:

#### EQ + Crossfade
1. Enable both EQ and crossfade
2. Adjust EQ settings
3. Play songs with crossfade
4. EQ should apply during fade

#### Gapless + Smart Playlists
1. Open a smart playlist
2. Enable gapless playback
3. Play playlist
4. Should flow seamlessly

#### Search Filters + Radio
1. Search for songs
2. Apply filters
3. Start radio from filtered result
4. Radio should work correctly

#### System Tray + All Features
1. Minimize to tray
2. Use tray controls
3. All features should work in background

---

## 🐛 Known Issues to Watch For

### Potential Issues:
1. **EQ popup positioning** on small screens
2. **Crossfade** may not work if next track fails to load
3. **Gapless** requires next track to preload successfully
4. **Smart search** filters may not affect all result types
5. **Smart playlists** need library data to generate
6. **Radio** requires internet connection
7. **System tray** icon may not show on some Linux distros

### Workarounds:
- If EQ popup is off-screen, resize window
- If crossfade fails, disable and re-enable
- If gapless has gaps, check network connection
- If filters don't work, try resetting
- If smart playlists are empty, add more songs
- If radio fails, check internet connection
- If tray icon missing, check system settings

---

## ✅ Success Criteria

### All Features Pass If:
- ✅ No console errors
- ✅ UI is responsive
- ✅ Audio plays correctly
- ✅ Transitions are smooth
- ✅ Filters work as expected
- ✅ Playlists generate correctly
- ✅ Radio returns relevant songs
- ✅ Tray integration works
- ✅ App doesn't crash
- ✅ Performance is good

---

## 📊 Performance Benchmarks

### Expected Performance:
- **EQ popup**: Opens in < 100ms
- **Crossfade**: 3-second transition
- **Gapless**: 0ms gap
- **Search filters**: Updates in < 50ms
- **Smart playlists**: Generates in < 100ms
- **Radio**: Loads in < 3 seconds
- **Tray**: Responds in < 50ms

### Memory Usage:
- **Idle**: ~150MB
- **Playing**: ~200MB
- **With EQ**: +10MB
- **With Radio**: +20MB

---

## 🎯 Testing Priority

### High Priority (Test First):
1. ✅ System Tray (core functionality)
2. ✅ Equalizer (user-facing)
3. ✅ Smart Search (frequently used)

### Medium Priority:
4. ✅ Crossfade (audio quality)
5. ✅ Gapless (audio quality)
6. ✅ Smart Playlists (discovery)

### Low Priority (Test Last):
7. ✅ Song Radio (advanced feature)

---

## 📝 Bug Report Template

If you find a bug, report it with:

```
**Feature**: [Feature name]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Errors**: [Any errors in console]
**Screenshots**: [If applicable]
```

---

## 🎉 Completion

Once all tests pass:
- ✅ Mark features as tested
- ✅ Document any issues
- ✅ Update FINAL_IMPLEMENTATION_SUMMARY.md
- ✅ Ready for production!

---

**Happy Testing!** 🚀

