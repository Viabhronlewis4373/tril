# StealthMap PWA - Project Blueprint

## 1. Core Philosophy
A privacy-first, offline-capable mapping utility specifically designed to run inside a native Capacitor "Sidebar" app via a "PWA Loader". Built to operate seamlessly with zero unsolicited network requests. The PWA operates in two distinct modes—**Light** and **Heavy**—sharing the exact same local data but offering different levels of functionality and UI complexity.

## 2. Technical Stack
*   **Framework:** React 19 + Vite (TypeScript)
*   **Build Architecture:** Strict relative paths (`base: './'`) and Hash Routing (`HashRouter`) to ensure perfect compatibility with the PWA Loader's local on-device web server.
*   **Styling:** Tailwind CSS (Focus on the translucent, floating UI elements seen in references)
*   **Map Engine:** MapLibre GL JS (Open-source, highly performant WebGL vector/raster map renderer)
*   **Data Persistence:** IndexedDB (via `idb` or `dexie`) acting as the shared data layer accessible to the PWA Loader.

## 3. Key Features & Requirements

### 3.1. Mode Toggle (Light / Heavy)
*   **Toggle Switch:** A master UI switch to transition instantly between modes without reloading data.
*   **Light Mode:** Highly performant, minimalist map view. Core navigation, stealth features, and essential POIs only. Lower sensor polling.
*   **Heavy Mode:** Fully featured utility suite. Unlocks advanced tools (Radar, Net Analysis, Trace), maximum sensor integration, and dense data overlays.

### 3.2. Network & Privacy Controls
*   **Internet Kill Switch:** A master UI toggle that intercepts and blocks all outgoing network requests at the application/Service Worker level, ensuring strict offline behavior on demand.
*   **Tri-State GPS:**
    1.  **Off:** No location tracking.
    2.  **Private (Device Sensors):** Uses basic Geolocation API (relies on the Sidebar host's native permissions).
    3.  **Normal (Standard):** Full `enableHighAccuracy: true` for precise routing.

### 3.3. Map & Rendering
*   **Hybrid View:** Base satellite raster imagery layered with vector overlays for routes and POIs.
*   **Smart POI Visibility:** "Standout" POIs that bypass standard zoom-level culling, forcing them to remain visible from a high altitude regardless of zoom.
*   **Viewport Caching:** When the "Auto-Cache" toggle is enabled, the app intercepts the currently visible screen space and downloads the raster/vector tiles for the *current viewport* directly into IndexedDB, avoiding massive bulk region downloads.

### 3.4. Data Management (PWA Loader Bridge)
*   **No Manual Import/Export:** External file handling (import/export buttons) is removed.
*   **Direct Injection:** The app expects the host (Sidebar PWA Loader) to handle data sync. The PWA simply reads from and writes to the shared local storage (IndexedDB or injected `window` APIs). All bookmarks, routes, and custom POIs live here.

### 3.5. User Interface (Based on References)
*   **Edge-to-Edge Map:** Fullscreen map canvas.
*   **Floating Bottom Navigation:** Pill-shaped glassmorphic bottom bar containing: Settings, Map Layers, Bookmarks, Tools (Wrench), and Compass/Location.
*   **Floating Tool Panels:** Translucent overlay menus for Tools.
*   **Top HUD:** Floating coordinates, zoom level, and map scale readout.

### 3.6. System & Debugging: Log Keeper
*   **Access:** A dedicated Floating Action Button (FAB) that routes to a specific Log Keeper page.
*   **Controls:** A Master On/Off toggle switch to control logging activity.
*   **Actions:** "Copy to Clipboard" and "Download" buttons for easy log extraction.
*   **Filtering:** Time-filter pills (1h, 6h, 12h, 24h, All) to narrow down log history.
*   **Content:** Captures detailed app activity including Error types/codes, failed components, timestamps, and code-path stack traces. *Strictly NO content, NO credentials, NO PII.*

## 4. Development Phases

*   **Phase 1: Foundation, UI Shell, & Log Keeper**
    *   Set up React + Vite + Tailwind.
    *   Configure Vite for relative asset paths (`base: './'`) and set up Hash Routing.
    *   Implement the Log Keeper utility (FAB, dedicated page, master toggle, time filters, export tools).
    *   Build the core floating UI layout (Bottom Nav, Tool Modals, Top HUD) over a placeholder background.
    *   Add the Light/Heavy mode toggle state to the global context.
*   **Phase 2: Map Engine & Core Controls**
    *   Integrate MapLibre GL JS.
    *   Implement the Tri-State GPS logic.
    *   Set up the Hybrid map style (Satellite base + Vector overlay).
*   **Phase 3: Offline Caching System** (Done)
    *   Implement IndexedDB storage mechanism.
    *   Build the "Auto-Cache Viewport" logic (calculating visible tiles and saving them).
    *   Implement the Internet Kill Switch toggle via Service Worker interception.
*   **Phase 4: POI Management & Host Integration** (Done)
    *   Build POI placement and the "Standout" altitude logic.
    *   Wire up the data layer to directly sync with the Sidebar PWA Loader's expected IndexedDB structure (removing legacy manual file imports).

## 5. Security & Constraints Log
*   **Strict No-Cloud Rule:** No data leaves the device unless explicitly sent to the local `localhost` Sidebar wrapper.
*   **No API Keys in Repo:** Any required map tile endpoints will be configured dynamically or fetched from public/open sources if available, otherwise injected strictly via environment variables that are never committed.
