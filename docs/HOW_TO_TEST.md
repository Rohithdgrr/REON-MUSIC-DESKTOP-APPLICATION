# How to Test Music Streaming

## Quick Start

The app is currently running! Here's how to test the new streaming features:

## 1. Basic Playback Test

1. **Search for a song**
   - Click on the Search tab (magnifying glass icon)
   - Type a song name (e.g., "Bohemian Rhapsody")
   - Press Enter or click Search

2. **Play the song**
   - Click on any track in the results
   - Watch for the loading spinner in the play button
   - Music should start playing automatically

3. **Test controls**
   - Click the play/pause button (or press Space)
   - Use the progress bar to seek
   - Adjust volume with the slider

## 2. Keyboard Shortcuts Test

Try these shortcuts while music is playing:

- **Space** - Pause/resume
- **→** - Skip forward 5 seconds
- **←** - Skip backward 5 seconds  
- **Shift + →** - Next track
- **Shift + ←** - Previous track
- **↑** - Volume up
- **↓** - Volume down
- **M** - Mute/unmute

## 3. Queue & Preloading Test

1. Search for multiple songs
2. Play the first one
3. Notice the next track preloads automatically (check console logs)
4. Click "Next" - should transition instantly
5. Try shuffle mode and verify it still works

## 4. Error Recovery Test

1. Play a song
2. Disconnect your internet briefly
3. The app should show "Retrying... (1/3)"
4. Reconnect internet
5. Playback should resume automatically

## 5. Caching Test

1. Play a song completely
2. Play the same song again
3. Check console - should say "Using cached URL"
4. Second playback should be much faster

## 6. UI Feedback Test

1. **Loading state** - Watch for spinner while loading
2. **Error messages** - Should appear at top of player bar
3. **Dismissible errors** - Click the × to close error messages
4. **Progress bar** - Should update smoothly (10 times per second)

## What to Look For

### ✅ Good Signs
- Music starts playing within 2-3 seconds
- No gaps between tracks
- Smooth progress bar movement
- Instant response to keyboard shortcuts
- Automatic retry on errors
- Fast second playback of same song

### ⚠️ Issues to Report
- Music takes >5 seconds to start
- Gaps between tracks
- Keyboard shortcuts not working
- Errors that don't auto-retry
- Progress bar jumping
- App crashes

## Console Logs to Watch

Open DevTools (F12) and look for:
- `Audio loaded successfully, duration: X`
- `Using cached URL for [videoId]`
- `Preloading next track: [title]`
- `Retry attempt X for [videoId]`

## Advanced Testing

### Test Different Scenarios
1. **Long tracks** - Play a 10+ minute song
2. **Rapid switching** - Quickly switch between tracks
3. **Seek while loading** - Try seeking before song fully loads
4. **Repeat modes** - Test repeat one, repeat all, no repeat
5. **Shuffle** - Enable shuffle and play multiple tracks

### Performance Check
1. Open Task Manager
2. Watch CPU and memory usage
3. Should stay reasonable (<500MB RAM, <10% CPU when playing)

## Troubleshooting

### If music doesn't play:
1. Check console for errors
2. Verify `window.electron.innertube` is available
3. Try restarting the app
4. Check if yt-dlp is installed: `py -m yt_dlp --version`

### If keyboard shortcuts don't work:
1. Make sure you're not typing in search box
2. Click somewhere in the app first
3. Check console for errors

### If preloading doesn't work:
1. Check console logs
2. Verify queue has multiple tracks
3. Check network tab in DevTools

## Need Help?

Check these files for details:
- `STREAMING_IMPROVEMENTS.md` - Technical details
- `KEYBOARD_SHORTCUTS.md` - Shortcut reference
- `VERIFICATION_RESULTS.md` - Implementation status

## Enjoy Testing! 🎵

The streaming should now be smooth, reliable, and responsive. Have fun testing!
