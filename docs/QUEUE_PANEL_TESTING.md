# Queue Panel Testing Checklist

## ✅ Phase 1.1: Queue Visualization - COMPLETED

### Integration Tests

#### 1. Queue Button in Player Bar
- [ ] Queue button appears in player bar (right side, before volume controls)
- [ ] Queue icon displays correctly
- [ ] Button has hover effect
- [ ] Tooltip shows "Queue" on hover
- [ ] Click toggles queue panel open/close

#### 2. Queue Panel Display
- [ ] Panel slides in from right side when opened
- [ ] Panel slides out when closed
- [ ] Panel has proper z-index (appears above content)
- [ ] Panel doesn't overlap player bar
- [ ] Panel is responsive on mobile (full width)
- [ ] Close button (X) works correctly

#### 3. Queue Header
- [ ] Shows queue icon and "Queue" title
- [ ] Displays queue statistics (song count, total duration)
- [ ] Duration format is correct (HH:MM:SS or MM:SS)
- [ ] Statistics update when queue changes

#### 4. Now Playing Section
- [ ] Shows current track with "Now Playing" label
- [ ] Displays track thumbnail (or placeholder)
- [ ] Shows animated playing indicator (3 bars)
- [ ] Displays track title and artist
- [ ] Shows track duration
- [ ] Has highlighted background (orange tint)

#### 5. Next Up Section
- [ ] Shows "Next Up" label
- [ ] Lists all upcoming tracks in order
- [ ] Each track shows thumbnail, title, artist, duration
- [ ] Tracks have hover effects
- [ ] Play overlay appears on thumbnail hover

#### 6. Drag & Drop Reordering
- [ ] Drag handle (6 dots) appears on each track
- [ ] Cursor changes to grab/grabbing
- [ ] Can drag tracks up and down
- [ ] Visual feedback during drag
- [ ] Queue updates after drop
- [ ] Current track stays in place
- [ ] Player continues playing after reorder

#### 7. Queue Actions
- [ ] Remove button (X) appears on hover
- [ ] Click remove button removes track from queue
- [ ] Queue updates immediately
- [ ] Current index adjusts correctly
- [ ] Can't remove currently playing track

#### 8. Play from Queue
- [ ] Click thumbnail plays that track
- [ ] Queue position updates
- [ ] Track starts playing immediately
- [ ] Now Playing section updates
- [ ] Next Up section updates

#### 9. Empty Queue State
- [ ] Shows empty state when queue is empty
- [ ] Displays queue icon (faded)
- [ ] Shows "No songs in queue" message
- [ ] Shows "Add songs to start playing" subtitle
- [ ] Action buttons are hidden

#### 10. Queue Actions Buttons
- [ ] "Save as Playlist" button appears when queue has songs
- [ ] Button shows save icon
- [ ] Click prompts for playlist name
- [ ] "Clear Queue" button appears when queue has songs
- [ ] Button shows delete icon
- [ ] Click shows confirmation dialog
- [ ] Confirm clears entire queue
- [ ] Cancel keeps queue intact

#### 11. Responsive Design
- [ ] Desktop (>768px): 400px width panel
- [ ] Mobile (≤768px): Full width panel
- [ ] Scrolling works on long queues
- [ ] Touch gestures work on mobile
- [ ] Drag & drop works on touch devices

#### 12. Performance
- [ ] Panel opens/closes smoothly (no lag)
- [ ] Drag & drop is responsive
- [ ] No memory leaks on repeated open/close
- [ ] Queue updates don't cause flicker
- [ ] Animations run at 60fps

### Integration with Player Store

#### 13. Queue State Management
- [ ] Queue state syncs with player store
- [ ] Current index updates correctly
- [ ] Queue changes persist during playback
- [ ] Shuffle mode works with queue panel
- [ ] Repeat mode works with queue panel

#### 14. Edge Cases
- [ ] Opening panel with no queue
- [ ] Opening panel with 1 song
- [ ] Opening panel with 100+ songs
- [ ] Removing last song in queue
- [ ] Reordering while track is loading
- [ ] Closing panel during drag operation
- [ ] Multiple rapid open/close operations

### Visual Design

#### 15. Styling
- [ ] Matches light orange theme
- [ ] Uses correct CSS variables
- [ ] Shadows and borders are consistent
- [ ] Typography is readable
- [ ] Icons are properly sized
- [ ] Spacing is consistent
- [ ] Transitions are smooth

#### 16. Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader announces queue changes
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG standards

## How to Test

### Manual Testing Steps

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Play a song**
   - Search for a song
   - Click play on any track
   - Verify player bar appears

3. **Open Queue Panel**
   - Click queue button in player bar
   - Verify panel slides in from right
   - Check Now Playing section shows current track

4. **Add Songs to Queue**
   - Play a playlist or category
   - Verify all songs appear in Next Up section
   - Check queue statistics are correct

5. **Test Drag & Drop**
   - Hover over a track in Next Up
   - Drag track to different position
   - Verify queue reorders
   - Play continues without interruption

6. **Test Play from Queue**
   - Click thumbnail of any track in Next Up
   - Verify that track starts playing
   - Check Now Playing section updates

7. **Test Remove from Queue**
   - Hover over a track
   - Click X button
   - Verify track is removed
   - Check queue statistics update

8. **Test Clear Queue**
   - Click "Clear Queue" button
   - Confirm in dialog
   - Verify queue is empty
   - Check empty state appears

9. **Test Save as Playlist**
   - Click "Save as Playlist" button
   - Enter playlist name
   - Verify prompt appears (TODO: implement save logic)

10. **Test Responsive Design**
    - Resize window to mobile size
    - Verify panel is full width
    - Test touch gestures
    - Check scrolling works

11. **Test Edge Cases**
    - Open panel with empty queue
    - Add 1 song and test
    - Add 100+ songs and test scrolling
    - Test rapid open/close
    - Test during track loading

## Known Issues / TODO

- [ ] Save as Playlist functionality not implemented (shows prompt only)
- [ ] Need to add keyboard shortcuts (Q to toggle queue)
- [ ] Need to add queue persistence (save/restore on app restart)
- [ ] Consider adding queue search/filter
- [ ] Consider adding bulk actions (select multiple, remove all)

## Next Steps

After queue panel testing is complete:
1. Implement Lyrics Display (Phase 1.2)
2. Add Dark Mode Toggle (Phase 1.3)
3. Implement Playlist Covers (Phase 1.4)
4. Add Offline Mode (Phase 1.5)
