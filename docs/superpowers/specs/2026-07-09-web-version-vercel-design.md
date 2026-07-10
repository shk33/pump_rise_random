# Web version of Pump Rise: Random, deployed on Vercel

**Date:** 2026-07-09
**Status:** Approved design

## Goal

Ship a web version of the existing Expo app so it can be opened in a phone browser
without installing or updating a native app, deployed on Vercel with automatic
redeploys on every push to `main`.

## Context

The app is an Expo Router (SDK 54, React Native 0.81, React 19) companion tool for
the rhythm game *Pump It Up Rise*: a league-based random song/chart generator with
Explore and Search tabs and a song-detail modal that previews ~10s audio clips.

It is already ~90% web-ready:

- `react-native-web` and `react-dom` are already installed.
- `app.json` already declares `web.bundler = "metro"` and `web.output = "static"`.
- `app/+html.tsx` and `.web.ts` platform variants already exist.
- **No backend, no runtime decryption.** Song metadata is a bundled static
  `data/songs.json`; banners and preview MP3s are bundled local assets loaded via
  `require.context`. The AES/DataAssets decryption was a one-time offline extraction.
- Persistence is AsyncStorage (mute setting), which maps to localStorage on web.

## Approach

Use Expo's built-in **static web export** — one codebase for iOS, Android, and web.
`npx expo export --platform web` produces a static `dist/` folder (HTML + JS +
bundled assets) that Vercel serves directly.

**Rejected alternatives:**
- A parallel Next.js / plain-web rewrite — discards all working screens and the
  415-song data/generator logic. Not worth it.
- Client-only SPA export — worse first paint/SEO than the static output already
  configured.

## Decisions (confirmed with user)

1. **Deploy method:** Connect the GitHub repo `shk33/pump_rise_random` to Vercel.
   Push to `main` → automatic rebuild + deploy. (No manual CLI step for updates.)
2. **Preview audio on web:** Play after first tap. Browsers block audio autoplay
   before a user gesture; keep native autoplay behavior unchanged, and on web make
   the preview start on user interaction.
3. **Verify locally first:** Get the web build running and fix web-specific breakage
   locally before wiring up Vercel.

## Code changes

### 1. Web-safe preview autoplay — `app/song/[songId].tsx`

Currently the screen autoplays the preview on mount via `useAudioPlayer` +
`player.play()`. On web this may be blocked by the browser autoplay policy.

Change: on web only, attempt to play on mount (entering the detail screen is itself a
tap, which often satisfies the gesture requirement), and register a one-time
"play on first user interaction" fallback for browsers that still block it. Native
platforms keep current behavior. The existing persisted mute toggle is respected.

### 2. Web verification-and-fix pass (while running locally)

Confirm under the Metro web bundler and fix anything that breaks:
- `require.context` asset bundling for banners (`utils/imageLoader.ts`) and preview
  MP3s (`utils/audioLoader.ts`).
- `react-native-paper` Portal/Modal rendering (ResultsModal, LeagueSelectionModal).
- `expo-linear-gradient` and `react-native-reanimated` on web.
- Fonts (`expo-font`) and vector icons.

No large breakage expected — all of these support web — but this is where surprises
surface.

## Deploy wiring

### `vercel.json` (new)

- Build command: `npx expo export --platform web`
- Output directory: `dist`
- A rewrite so client-side routes (e.g. `/song/13a3`) resolve to the app shell
  instead of 404ing on direct load / refresh.

### One-time Vercel setup (user action, with exact steps provided)

Connect `shk33/pump_rise_random` in the Vercel dashboard. Requires the user's Vercel
login. After connection, every push to `main` triggers an automatic deploy.

## Non-blocking notes

- **Bundle size:** ~45MB of previews + banners become individually-served static
  files, loaded on demand. Fine for Vercel; the browser fetches only what is viewed.
- **YouTube links** (`expo-web-browser`) open a new browser tab on web. Works as-is.
- **Mute setting** persists via localStorage on web. Works as-is.

## Success criteria

- `npx expo export --platform web` produces a working `dist/` locally.
- Locally served build: all three tabs render, song search works, a song-detail
  modal opens, banner shows, preview plays after interaction, mute toggle persists,
  YouTube link opens.
- `vercel.json` present; pushing to `main` produces a live Vercel URL openable on a
  phone browser, and direct-loading a `/song/<id>` URL does not 404.

## Out of scope

- Desktop-specific responsive redesign (mobile-first layout stands as-is).
- Muted-autoplay-then-unmute behavior (explicitly not chosen).
- Custom domain (can be added later in Vercel).
- PWA / offline / install-to-homescreen (possible follow-up, not this pass).
