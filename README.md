# Axiom

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Electron-1f1f1f?style=for-the-badge&logo=electron&logoColor=9FEAF9">
  <img src="https://img.shields.io/badge/Frontend-React-1f1f1f?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/Database-SQLite-1f1f1f?style=for-the-badge&logo=sqlite&logoColor=0F80CC">
  <img src="https://img.shields.io/badge/License-MIT-1f1f1f?style=for-the-badge">
</p>

<p align="center">
  Modern OSINT investigation and intelligence correlation workspace built for analysts, researchers, and cybersecurity operations.
</p>

---

# Overview

Axiom is a local-first intelligence and investigation platform designed for organizing digital investigations, correlating identities, managing evidence, and visualizing relationships in a modern analyst-focused environment.

Unlike generic OSINT tooling focused solely on enumeration, Axiom focuses on:

- investigation workflows
- intelligence organization
- entity correlation
- evidence management
- visual relationship analysis
- operational usability

Axiom is built as a standalone Electron desktop application and does not require a hosted backend or cloud infrastructure.

---

# Core Features

## Investigation Workspace
Create and manage investigations with:
- case tracking
- priority/status management
- evidence linking
- investigation notes
- tagging and classification

---

## Identity Correlation
Analyze and correlate:
- usernames
- aliases
- domains
- emails
- IP addresses
- social profiles

Generate:
- confidence scoring
- relationship suggestions
- identity clustering
- investigation links

---

## Relationship Graphing
Interactive intelligence graph system featuring:
- draggable nodes
- zoom/pan navigation
- linked entity visualization
- evidence relationships
- graph exploration workflows

Built with:
- React Flow
- modern graph rendering
- analyst-focused UX

---

## Evidence Vault
Store and organize:
- screenshots
- JSON files
- markdown
- text evidence
- URLs
- imported investigation artifacts

Features:
- tagging
- metadata tracking
- linked investigations
- evidence search
- timeline integration

---

## Timeline Analysis
Track investigation chronology with:
- event logging
- timestamped discoveries
- evidence timelines
- historical tracking
- linked entities/events

---

## Markdown Notes System
Integrated analyst notes system with:
- markdown support
- code blocks
- backlinks
- entity references
- linked evidence

---

# Design Philosophy

Axiom is intentionally designed to avoid:
- generic recon spam
- low-value username dumpers
- bloated web infrastructure
- fake “hacker” aesthetics
- terminal gimmicks

Instead, Axiom focuses on:
- operational usability
- modern intelligence workflows
- clean analyst-focused UI
- scalable investigation tooling

---

# Screenshots

> Screenshots coming soon.

---

# Technology Stack

| Component | Technology |
|---|---|
| Desktop Framework | Electron |
| Frontend | React |
| Build System | Vite |
| Styling | TailwindCSS |
| Database | SQLite |
| Graph Engine | React Flow |
| Runtime | Node.js |

---

# Architecture

```txt
src/
├── main/
│   ├── main.js
│   ├── preload.js
│   ├── ipc/
│   └── services/
│
├── renderer/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── store/
│       ├── styles/
│       └── lib/
│
└── database/