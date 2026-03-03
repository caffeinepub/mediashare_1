# Specification

## Summary
**Goal:** Integrate Razorpay (INR payments) and Google AdSense into the Media Share app alongside the existing Stripe integration.

**Planned changes:**
- Add backend methods to store and retrieve Razorpay Key ID and Secret, create Razorpay orders, and verify payment signatures (HMAC-SHA256); upgrade caller's subscription to premium on verified payment
- Add backend methods to store and retrieve a Google AdSense Publisher ID in stable canister state
- Add a `RazorpaySetupModal` component and `useRazorpayConfig` / `useSetRazorpayConfiguration` hooks; add a "Razorpay Setup" button in the Settings page for authenticated users
- Update the Upgrade page to show a Razorpay payment option (₹499/month) when Razorpay is configured; dynamically load the Razorpay JS SDK at checkout, open the checkout modal, verify payment via backend, and redirect to PaymentSuccess or PaymentFailure accordingly
- Add an "AdSense Configuration" section to the Settings page with a Publisher ID input and `useAdSenseConfig` hook
- Dynamically inject the Google AdSense `<script>` tag into the document head when a publisher ID is configured
- Add AdSense ad unit placeholders (`ins.adsbygoogle`) below the video player in `VideoPlayer.tsx` and in the sidebar slot in `Layout.tsx`

**User-visible outcome:** Authenticated users in India can upgrade to premium via Razorpay (INR). Admins can configure Razorpay credentials and a Google AdSense Publisher ID from the Settings page, and AdSense ads will appear below the video player and in the sidebar when configured.
