<div align="center">

<br />

```
 █████╗ ██╗  ██╗██╗ ██████╗ ███╗   ███╗
██╔══██╗╚██╗██╔╝██║██╔═══██╗████╗ ████║
███████║ ╚███╔╝ ██║██║   ██║██╔████╔██║
██╔══██║ ██╔██╗ ██║██║   ██║██║╚██╔╝██║
██║  ██║██╔╝ ██╗██║╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝
```

**Local cyber intelligence analyst workstation**

[![GitHub](https://img.shields.io/badge/GitHub-osint--intell%2FAxiom-0d1117?style=for-the-badge&logo=github&logoColor=white)](https://github.com/osint-intell/Axiom)
[![Electron](https://img.shields.io/badge/Electron-28-1a1a2e?style=for-the-badge&logo=electron&logoColor=22D3EE)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/React-18-1a1a2e?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-local--first-1a1a2e?style=for-the-badge&logo=sqlite&logoColor=60A5FA)](https://www.sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-1a1a2e?style=for-the-badge&logo=opensourceinitiative&logoColor=22C55E)](./LICENSE)
[![Use](https://img.shields.io/badge/Use-Authorized%20Only-1a1a2e?style=for-the-badge&logo=shield&logoColor=EF4444)](#-ethical-use-notice)

<br />

> Axiom is a fully offline, secure desktop investigation platform built for OSINT analysts.  
> It is not a recon script. It is not a username checker. It is a professional intelligence workspace.

<br />

</div>

---

## What is Axiom?

Axiom is a standalone Electron desktop application for building structured intelligence investigations. Analysts create cases, add identifiers, map entity relationships, attach evidence, and trace timelines — all locally, all in one workspace.

It is designed to feel like a real analyst workstation: organized, visual, and built around investigative workflow rather than raw data dumps.

---

## ✦ Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Live stats, active investigations, recent evidence, and quick-create actions |
| **Investigations** | Case management with priority, status, tags, and full entity/evidence tabs |
| **Identity Correlation** | Multi-vector analysis engine — username, alias, email, domain, IP, phone |
| **Relationship Graph** | React Flow graph with draggable nodes, typed edges, and confidence scoring |
| **Evidence Vault** | Secure file import (TXT, JSON, MD, PNG, JPG) with tagging and preview |
| **Timeline** | Chronological event log linked to investigations and entities |
| **Notes** | Markdown workspace with code blocks, tagging, and investigation links |
| **Exports** | One-click export for cases, graphs, timelines, notes, and full bundles |
| **Settings** | Theme, graph layout, database backup/restore, and runtime posture display |

---

## ✦ Identity Correlation Engine

The correlation engine performs two-phase analysis on any combination of identifiers:

**Phase 1 — Input analysis (works immediately, no data required)**
- IPv4 format validation, subnet extraction, public/private classification
- Email format check, provider identification (including privacy-focused services)
- Cross-field matching: email domain ↔ domain field, local-part ↔ username
- Username/alias similarity scoring (Levenshtein distance)
- Numeric suffix and separator pattern detection
- Domain TLD analysis including `.onion` / `.i2p` darknet flags
- Multi-vector richness bonus for 2+ simultaneous identifiers

**Phase 2 — Database cross-reference**
- Compares inputs against all entities stored across investigations
- Exact value, domain overlap, IP subnet, and username similarity matching
- Boosts confidence when DB matches are found

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| Desktop runtime | Electron 28 |
| Build system | electron-vite 2 + Vite 5 |
| UI framework | React 18 |
| Styling | TailwindCSS 3 |
| Database | SQLite via `better-sqlite3` |
| State management | Zustand |
| Graph visualization | React Flow |
| Routing | React Router DOM v6 |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |

---

## ✦ Quick Start

```bash
# Clone the repository
git clone https://github.com/osint-intell/Axiom.git
cd Axiom

# Install dependencies (also rebuilds native modules for Electron)
npm install

# Start development mode
npm run dev
```

---

## ✦ All Commands

```bash
# Development — starts Electron + hot-reload renderer
npm run dev

# Production build — outputs to out/
npm run build

# Package distributable — creates installer in dist/
npm run dist

# Manually rebuild native modules (if you switch Node versions)
npx electron-rebuild -f -w better-sqlite3
```

---

## ✦ Project Structure

```
Axiom/
├── src/
│   ├── main/                        # Electron main process
│   │   ├── index.js                 # BrowserWindow, app lifecycle
│   │   ├── ipc/
│   │   │   └── handlers.js          # All ipcMain.handle() registrations
│   │   └── services/
│   │       ├── databaseService.js   # SQLite init + schema
│   │       ├── investigationService.js
│   │       ├── entityService.js     # Includes correlation engine
│   │       ├── relationshipService.js
│   │       ├── evidenceService.js
│   │       ├── timelineService.js
│   │       ├── notesService.js
│   │       └── settingsService.js
│   ├── preload/
│   │   └── index.js                 # contextBridge → window.axiom IPC bridge
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.jsx             # React entry point
│           ├── App.jsx              # Router + layout shell
│           ├── pages/               # One file per navigation item
│           ├── components/          # Reusable UI components
│           ├── layouts/             # Sidebar, Header, MainLayout
│           ├── styles/              # globals.css + Tailwind config
│           └── store/
│               └── useAppStore.js   # Zustand global store
├── electron.vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## ✦ Security Architecture

Axiom follows Electron security best practices throughout:

| Control | Status |
|---|---|
| `contextIsolation: true` | ✅ Enabled |
| `nodeIntegration: false` | ✅ Disabled |
| Renderer ↔ main boundary | ✅ `window.axiom` preload bridge only |
| File import validation | ✅ Extension and size checks in main process |
| Imported content execution | ✅ Never — treated as data only |
| Content Security Policy | ✅ Defined in renderer HTML shell |
| `eval` / remote code | ✅ Not used anywhere |

All IPC calls go through `ipcRenderer.invoke` → `ipcMain.handle`. The renderer has zero direct Node.js access.

---

## ✦ Packaging

Electron Builder is pre-configured for cross-platform distribution:

```bash
npm run dist
```

| Platform | Format |
|---|---|
| Windows | NSIS installer |
| Linux | AppImage |
| macOS | DMG (Utility app category) |

Output is placed in `dist/`.

> **Note:** On first install or after switching Node.js versions, run  
> `npx electron-rebuild -f -w better-sqlite3` to rebuild the native SQLite module.

---

## ✦ Ethical Use Notice

> Axiom is intended exclusively for **authorized investigations**, defensive security research, and **lawful OSINT operations**.

- Only analyze subjects you are legally authorized to investigate
- Respect applicable privacy laws (GDPR, CCPA, etc.)
- Comply with platform terms of service when collecting open-source data
- Do not use Axiom to harass, stalk, or harm individuals
- All data remains local — you are solely responsible for how it is used

The OSINT-INTELL organization does not condone unauthorized access, illegal surveillance, or misuse of intelligence tooling.

---

<div align="center">

Built by [OSINT-INTELL](https://github.com/osint-intell) · [github.com/osint-intell/Axiom](https://github.com/osint-intell/Axiom)

</div>
