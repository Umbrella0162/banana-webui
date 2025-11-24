# Project Context: next-banana

## 1. Overview
**next-banana** is a client-side, generative AI web application built with **Next.js 16** (App Router) and **React 19**. It provides a clean, yellow-themed ("Banana Joy") user interface for generating images using Google's **Gemini API** (specifically Gemini 2.5 Flash and Pro models).

The application operates entirely in the browser (client-side), storing API keys in local storage and communicating directly with Google's REST endpoints without a backend proxy for generation.

**Progressive Web App (PWA):** The application supports PWA features using Next.js 16's native PWA capabilities, allowing users to install it on their devices and use it offline.

## 2. Key Technologies
*   **Framework:** Next.js 16.0.3 (App Router)
*   **Build Tool:** Turbopack (default in Next.js 16)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI primitives), `tw-animate-css`
*   **API Integration:** Native `fetch` to Google Gemini REST API (v1beta)
*   **State/Logic:** React Hooks, `sonner` for notifications
*   **Utilities:** `jszip` for downloads, `react-markdown` for rendering text responses
*   **PWA:** Next.js native manifest + custom service worker

## 3. Project Structure
```
src/
├── app/
│   ├── globals.css      # Global Tailwind styles and theme definitions
│   ├── layout.tsx       # Root layout structure
│   ├── manifest.ts      # PWA manifest (Next.js native)
│   ├── page.tsx         # Main application entry point
│   └── offline/
│       └── page.tsx     # Offline fallback page
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui inspired)
│   ├── ImageGenerator.tsx # Main container/controller component
│   ├── ConfigPanel.tsx    # Settings side panel (aspect ratio, resolution)
│   ├── PromptInput.tsx    # Text input area
│   ├── register-sw.tsx    # Service worker registration component
│   └── ...              # Other feature-specific components
└── lib/
    ├── gemini-client.ts # Core API client wrapper
    ├── config.ts        # App configuration constants
    └── storage.ts       # LocalStorage wrappers

public/
├── sw.js                # Custom service worker
├── icon-192.png         # PWA icon (192x192)
├── icon-512.png         # PWA icon (512x512)
└── apple-touch-icon.png # Apple touch icon (180x180)
```

## 4. Development & Usage

### Installation & Running
```bash
npm install    # Install dependencies
npm run dev    # Start development server at http://localhost:3000
```

### Building
```bash
npm run build  # Create production build (uses Turbopack)
npm start      # Run production server
```

### PWA Testing
Service worker only registers in production mode. To test PWA features:
```bash
npm run build && npm start
```
Then visit `http://localhost:3000` and check for the install prompt.

### Codebase Conventions
*   **Styling:** Use Tailwind utility classes. Custom colors (like `banana`) are defined in global CSS/Tailwind config.
*   **Components:** Functional components with TypeScript interfaces for props. Placed in `src/components`.
*   **API Calls:** All Gemini API logic resides in `src/lib/gemini-client.ts`. Do not make raw API calls in UI components; use the `GeminiImageClient` class.
*   **State:** Local state is preferred for UI controls. Global app state (like API keys) is managed via local storage and passed down or accessed via context/hooks where applicable.
*   **PWA:** Manifest is defined in `src/app/manifest.ts` using Next.js native API. Service worker is in `public/sw.js` and registered via `src/components/register-sw.tsx`.

## 5. Key Features & Logic
*   **API Key Management:** Stored in browser `localStorage`. Never sent to a backend server.
*   **Image Generation:** Supports Text-to-Image and Image-to-Image (multimodal).
*   **Configuration:**
    *   **Models:** Gemini 2.5 Flash, Gemini 3 Pro, etc.
    *   **Aspect Ratios:** 1:1, 16:9, 9:16, 4:3, 3:4.
    *   **Tools:** Google Search integration (for Flash model).
*   **Output:** Displays images in a grid/gallery. Supports "Text Only" fallbacks (displayed as a yellow placeholder).
*   **PWA Features:**
    *   **Installable:** Can be installed on desktop and mobile devices.
    *   **Offline Support:** Custom service worker provides basic offline functionality.
    *   **Caching:** Network-first strategy with fallback to cache.

## 6. PWA Implementation Details

### Manifest
- **Location:** `src/app/manifest.ts`
- **Type:** Next.js native `MetadataRoute.Manifest`
- **Route:** Auto-generated at `/manifest.webmanifest`
- **Features:** App name, icons, theme color, display mode

### Service Worker
- **Location:** `public/sw.js`
- **Strategy:** Network-first with cache fallback
- **Caching:** Static assets, pages, and API responses
- **Offline:** Falls back to `/offline` page for navigation requests
- **Registration:** Client-side in production only (`src/components/register-sw.tsx`)

### Icons
- `icon-192.png`: 192x192 PWA icon (maskable)
- `icon-512.png`: 512x512 PWA icon (maskable)
- `apple-touch-icon.png`: 180x180 Apple touch icon

## 7. Build & Deployment Considerations
*   **Build Tool:** Uses Turbopack by default (Next.js 16). No need for `--webpack` flag.
*   **Deployment:** Optimized for Vercel or static export.
*   **Security:** Since it's client-side, CORS is handled by the browser. Users must provide their own API keys.
*   **PWA:** Service worker requires HTTPS in production (or localhost for testing).
