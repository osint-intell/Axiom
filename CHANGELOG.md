# Changelog

All notable changes to Axiom are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2025

### Added

- **Dashboard** — live stat cards, investigation activity feed, quick-create actions, recent cases table
- **Investigations** — full case management with priority, status, tags, notes, evidence, and entity tabs
- **Identity Correlation Engine** — two-phase analysis: input introspection (IP, email, username, domain, phone) + DB cross-reference across all investigations
- **Relationship Graph** — React Flow graph with typed draggable nodes, confidence-scored edges, zoom/pan, and persistence
- **Evidence Vault** — secure file import (TXT, JSON, MD, PNG, JPG) with tagging, filtering, and preview drawer
- **Timeline** — chronological event log linked to investigations and entities
- **Notes** — Markdown workspace with code blocks, tagging, and investigation links
- **Exports** — one-click export for cases, timelines, graphs, notes, and full bundles (JSON + Markdown)
- **Settings** — theme, graph layout, database backup/restore, runtime posture display
- **SQLite persistence** — `better-sqlite3` with full schema: investigations, entities, relationships, evidence, notes, timeline_events, settings
- **Secure IPC bridge** — `contextIsolation: true`, `nodeIntegration: false`, full `window.axiom` preload API
- **Security hardening** — UUID validation on all mutation IPC handlers, renderer never receives absolute system paths, file import always uses system dialog

### Security

- Renderer-supplied file paths rejected in `evidence:importFile` — path only comes from native system dialog
- All returned file paths stripped to filename only before reaching renderer
- IPC handler ID validation added for all `update`, `delete`, and `getById` operations
- Settings key length limited to 128 characters

---

## Unreleased

_Changes staged for next release will appear here._
