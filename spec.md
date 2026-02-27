# Specification

## Summary
**Goal:** Add a Profile page for the authenticated user and fix video view count logic to only increment after actual playback.

**Planned changes:**
- Add a "Profile" tab with a user icon to the bottom navigation bar that navigates to `/profile`
- Create a `/profile` route in the router rendering the new User Profile page
- Build a User Profile page displaying the user's display name, channel name, principal ID, channel stats (video count, total views, total likes), a grid of uploaded videos, and a grid of uploaded photos, with a link to Settings for editing
- Show a sign-in prompt on the Profile tab and page for unauthenticated users
- Fix view count increment logic so it only triggers after at least 5 seconds of active playback, only once per page visit, and only for authenticated users

**User-visible outcome:** Users can tap a Profile tab in the bottom nav to view their channel info and stats, and video view counts will only increase when a user has actually watched at least 5 seconds of a video.
