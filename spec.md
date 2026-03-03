# Specification

## Summary
**Goal:** Fix data loss caused by a canister upgrade (Version 35) that wiped previously uploaded videos and associated data, and restore data persistence across future upgrades.

**Planned changes:**
- Audit and fix `main.mo` stable variable declarations and `preupgrade`/`postupgrade` hooks to ensure videos, comments, likes, ratings, view counts, and thumbnails are preserved across canister upgrades
- Audit and fix migration logic to ensure it only adds new fields (`razorpayConfig`, `adSenseConfig`) without resetting or dropping any existing stable collections (videos, photos, comments, likes, ratings, etc.)
- Add a dismissible banner on the Home page and Video Gallery page informing users that a technical issue occurred during the latest update and that video restoration is in progress

**User-visible outcome:** Existing uploaded videos remain visible after deploys, and users on the Home and Video Gallery pages see a clear notice about the temporary technical issue with video visibility.
