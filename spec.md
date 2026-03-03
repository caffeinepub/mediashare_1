# Specification

## Summary
**Goal:** Fix the broken Stripe premium subscription flow and add a simulated ad revenue system with a dashboard UI.

**Planned changes:**
- Fix `createCheckoutSession` backend call to correctly generate a Stripe checkout URL and redirect the user to the Stripe-hosted payment page
- Fix `PaymentSuccess.tsx` to verify the session and upgrade the user to premium via `setSubscriptionStatus`
- Fix `PaymentFailure.tsx` to display a retry option after cancelled or failed payment
- Fix `useGetUserSubscriptionStatus` hook to always reflect the correct tier ('free' or 'premium') from the backend
- Hide the `UpgradePrompt` component for users with an active premium subscription
- Add backend data model to track ad impressions and revenue per video and per creator in stable storage
- Add `recordAdImpression(videoId)` backend endpoint to log an ad view and accrue simulated revenue (fixed CPM rate of $2.00 per 1000 impressions) to the video uploader
- Add `getAdRevenueForCaller()` backend endpoint returning total ad earnings for the authenticated user
- Add `getAdRevenueForVideo(videoId)` backend endpoint returning earnings for a specific video
- Add an "Ad Revenue" section to the Profile and/or Settings page showing total earnings (in USD) and a per-video breakdown of title, impressions, and estimated revenue
- Automatically call `recordAdImpression` after 10 seconds of video playback on the VideoPlayer page
- Hide the ad revenue section from non-authenticated users

**User-visible outcome:** Users can successfully subscribe to premium via Stripe, see their correct subscription tier in Settings, and authenticated creators can view their simulated ad earnings and per-video impression stats on their Profile or Settings page.
