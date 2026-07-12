# 💻 AssetFlow Client Application (Frontend)

This directory contains the React client application for the AssetFlow Enterprise Asset & Resource Management System. It is built using React 19, Vite, and Tailwind CSS v4.

---

## 🛠️ Frontend Tech Stack

*   **UI Library**: React 19 (Hooks, Context, Functional Components)
*   **Build Tool**: Vite 8
*   **Styling**: Tailwind CSS v4 + Vanilla CSS Custom Layout Utilities ([index.css](src/index.css))
*   **Code Quality**: Oxlint Configuration

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v20+ recommended)
*   The AssetFlow backend server must be configured and running (default: port `3000`)

### Installation & Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start development server**:
    ```bash
    npm run dev
    ```
    The application will start, and the dev server will configure a proxy redirecting `/api` requests to the local backend at `http://localhost:3000`.
3.  **Access the application**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Source File Directory Outline

*   `src/assets/`: Media files (SVG icons, imagery assets).
*   `src/controllers/`: Contains `useAppController.js`, which handles auth flow, navigation state, API actions, and modals synchronization.
*   `src/models/`: Direct API fetch wrapper and service clients layer (`api.js`, `services.js`).
*   `src/views/`: Layout and views presentation.
    *   `src/views/components/`: Subcomponents (Modals dialogs, KPICards, Header, Sidebar, Toast alerts).
    *   `src/views/screens/`: Views for specific tabs (Dashboard, Assets directory, Allocations list, Bookings scheduler, Maintenance tickets, Compliance Audits, Setup directory, Reports).
    *   `src/views/AppLayout.jsx`: Main panels layout coordinator.
*   `src/index.css`: Global design tokens, theme configurations, scrollbar layouts, and custom CSS classes.

---

## 🏗️ Production Build

To bundle the application for production deployment, run:
```bash
npm run build
```
This generates static, highly optimized client assets inside the `dist/` directory, ready to be served by any static file server or CDN.
