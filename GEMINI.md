# Project Context: next-banana

## 1. Overview
**next-banana** is a client-side, generative AI web application built with **Next.js 16** (App Router) and **React 19**. It provides a clean, yellow-themed ("Banana Joy") user interface for generating images using Google's **Gemini API** (specifically Gemini 2.5 Flash and Pro models).

The application operates entirely in the browser (client-side), storing API keys in local storage and communicating directly with Google's REST endpoints without a backend proxy for generation.

## 2. Key Technologies
*   **Framework:** Next.js 16.0.3 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI primitives), `tw-animate-css`
*   **API Integration:** Native `fetch` to Google Gemini REST API (v1beta)
*   **State/Logic:** React Hooks, `sonner` for notifications
*   **Utilities:** `jszip` for downloads, `react-markdown` for rendering text responses

## 3. Project Structure
```
src/
├── app/
│   ├── globals.css      # Global Tailwind styles and theme definitions
│   ├── layout.tsx       # Root layout structure
│   └── page.tsx         # Main application entry point
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui inspired)
│   ├── ImageGenerator.tsx # Main container/controller component
│   ├── ConfigPanel.tsx    # Settings side panel (aspect ratio, resolution)
│   ├── PromptInput.tsx    # Text input area
│   └── ...              # Other feature-specific components
└── lib/
    ├── gemini-client.ts # Core API client wrapper
    ├── config.ts        # App configuration constants
    └── storage.ts       # LocalStorage wrappers
```

## 4. Development & Usage

### Installation & Running
```bash
npm install    # Install dependencies
npm run dev    # Start development server at http://localhost:3000
```

### Building
```bash
npm run build  # Create production build
npm start      # Run production server
```

### Codebase Conventions
*   **Styling:** Use Tailwind utility classes. Custom colors (like `banana`) are defined in global CSS/Tailwind config.
*   **Components:** Functional components with TypeScript interfaces for props. Placed in `src/components`.
*   **API Calls:** All Gemini API logic resides in `src/lib/gemini-client.ts`. Do not make raw API calls in UI components; use the `GeminiImageClient` class.
*   **State:** Local state is preferred for UI controls. Global app state (like API keys) is managed via local storage and passed down or accessed via context/hooks where applicable.

## 5. Key Features & Logic
*   **API Key Management:** Stored in browser `localStorage`. Never sent to a backend server.
*   **Image Generation:** Supports Text-to-Image and Image-to-Image (multimodal).
*   **Configuration:**
    *   **Models:** Gemini 2.5 Flash, Gemini 3 Pro, etc.
    *   **Aspect Ratios:** 1:1, 16:9, 9:16, 4:3, 3:4.
    *   **Tools:** Google Search integration (for Flash model).
*   **Output:** Displays images in a grid/gallery. Supports "Text Only" fallbacks (displayed as a yellow placeholder).

## 6. Future Considerations
*   **Deployment:** Optimized for Vercel or static export (if server components aren't critical).
*   **Security:** Since it's client-side, CORS is handled by the browser. Users must provide their own API keys.
