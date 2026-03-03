# Specification

## Summary
**Goal:** Fix the view count increment feature in the VideoPlayer so that it reliably fires once per valid viewing session.

**Planned changes:**
- Fix the watch-time tracking logic in the VideoPlayer page so that after 5 seconds of actual playback, `useIncrementVideoView` is called exactly once per session
- Ensure the increment is not triggered multiple times due to re-renders or state resets
- Invalidate the related video queries on successful increment so the updated view count is reflected in the UI

**User-visible outcome:** After watching at least 5 seconds of a video, the view count increments by 1 and the updated count is immediately visible on the VideoPlayer page.
