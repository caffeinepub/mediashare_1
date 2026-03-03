# Specification

## Summary
**Goal:** Add a Stripe-based Premium subscription tier to Media Share, allowing users to upgrade from free to premium via a Stripe Checkout flow.

**Planned changes:**
- Add subscription status (free/premium) storage per user in the backend, with query and update functions to get and set subscription status
- Replace the hardcoded free-tier return in `useGetUserSubscriptionStatus.ts` with a real backend call
- Add a "Go Premium" button on the Upgrade page that initiates a Stripe Checkout session
- On successful Stripe payment, call the backend to mark the user as premium and reflect the updated status in the UI
- Update the UpgradePrompt component and Settings page to use real subscription data from the backend

**User-visible outcome:** Authenticated users can visit the Upgrade page, click "Go Premium," complete a Stripe payment, and have their account upgraded to premium — with the UI across settings and upgrade prompts reflecting their real premium status.
