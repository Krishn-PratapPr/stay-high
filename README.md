# 🌿 StayHigh (Trip Vibes)

> **A Curated Playlist for the Hazy Moments**

StayHigh is a dark, atmospheric, vinyl-inspired web music player designed for immersive chillout sessions. Built with Next.js 16, React 19, and Tailwind CSS, it seamlessly streams curated YouTube playlists inside an elegant, tactile user interface featuring spinning vinyl aesthetics, dynamic soundwave animations, and customizable player controls.

---

## ✨ Features

- 🎵 **Curated YouTube Playlist Integration**: Automatically fetches and parses track titles, channels, and high-resolution artwork from YouTube Data API v3.
- 💿 **Spinning Vinyl Disc Aesthetics**: Realistic vinyl record artwork with grooved reflections and synchronized rotational playback animations.
- 🎛️ **Full Media Playback Controls**:
  - Play, Pause, Skip Next, Skip Previous
  - Progress Timeline Slider with real-time seeking
  - Shuffle and Repeat track modes
  - Volume control slider & Mute toggle
- ⌨️ **Keyboard Shortcuts**:
  - `Space` : Play / Pause
  - `←` (Left Arrow) : Previous track / Restart track
  - `→` (Right Arrow) : Next track
- 📜 **Interactive Playlist Drawer & Sidebar**:
  - **Desktop**: Collapsible & expandable side menu with quick track selection.
  - **Mobile**: Touch-friendly slide-over drawer menu.
  - **Live Equalizer**: Animated soundwave indicator for the currently active track.
- 🌌 **Atmospheric Design & Micro-animations**:
  - Deep forest theme (`#141c14`) paired with khaki gold (`#d9c89b`) and resin glow highlights.
  - SVG fractal noise background overlay & atmospheric vignette haze.
  - Typography powered by Google Fonts (*Playfair Display* & *Inter*).
- 🕒 **Live Utilities**:
  - Real-time digital clock (12-hour format with AM/PM).
  - Dynamic live online listener counter.
  - Fullscreen toggle mode for zero-distraction listening.
  - Direct developer contact link.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Core**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS animations
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: [React Player](https://github.com/cookpete/react-player) (YouTube integration)
- **Typography**: `Playfair Display` & `Inter` via `next/font`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher recommended)
- **npm**, **yarn**, **pnpm**, or **bun**
- A **YouTube Data API v3 Key** (from Google Cloud Console)

---

### Environment Setup

Create a `.env.local` file in the root directory of your project:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

> 💡 **Note**: Without a valid `YOUTUBE_API_KEY`, the application fallback route will error when attempting to fetch playlist items.

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Krishn-PratapPr/Stay-high.git
   cd Stay-high
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to experience StayHigh.

---

## 📂 Project Structure

```text
Trip vibes/
├── src/
│   └── app/
│       ├── api/
│       │   └── playlist/
│       │       └── route.ts     # YouTube Playlist API endpoint proxy
│       ├── globals.css          # Core styles, theme tokens, noise & animations
│       ├── layout.tsx           # Main layout & font loading
│       └── page.tsx             # Interactive player application UI
├── public/                      # Static assets & theme artwork
├── .env.local                   # Local environment configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Project dependencies & scripts
└── tsconfig.json                # TypeScript configuration
```

---

## 👤 Developer & Contact

Created with ❤️ by **Krishna**.
- **Instagram**: [@krishnaa_.98](https://www.instagram.com/krishnaa_.98)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
