# Contributing to Axiom

Thank you for your interest in contributing to Axiom. This document outlines how to get involved, what we expect from contributors, and how to submit changes.

---

## Before You Start

Axiom is an intelligence investigation platform. All contributions must align with the project's focus on **lawful, analyst-grade OSINT workflows**. We will not accept contributions that add:

- Automated scraping or mass data harvesting
- Exploits, vulnerability scanners, or attack tooling
- Features that bypass privacy controls or platform terms
- Integrations that call external APIs without explicit user action

If you're unsure whether your idea fits, open a discussion before writing code.

---

## Development Setup

```bash
git clone https://github.com/osint-intell/Axiom.git
cd Axiom
npm install
npm run dev
```

Requires Node.js 18+ and a compatible native build toolchain for `better-sqlite3`.  
If the app fails to start with a `NODE_MODULE_VERSION` error, run:

```bash
npx electron-rebuild -f -w better-sqlite3
```

---

## How to Contribute

### Reporting Bugs

Use the **Bug Report** issue template. Include:

- Steps to reproduce
- Expected vs actual behavior
- OS, Node version, Electron version
- Any relevant console output (sanitize personal paths before pasting)

### Suggesting Features

Use the **Feature Request** issue template. Describe:

- The investigation workflow gap it addresses
- How it fits the local-first, analyst-focused design
- Any security or privacy implications

### Submitting a Pull Request

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run the build: `npm run build`
5. Open a PR against `main` with a clear title and description

---

## Code Standards

- **Electron security**: never set `nodeIntegration: true`, `contextIsolation: false`, or `webSecurity: false`
- **IPC**: all renderer→main communication goes through the `window.axiom` preload bridge — no direct Node access from renderer
- **No absolute paths** in source code — use `app.getPath()`, `path.join()`, or relative paths
- **No secrets** in source — no API keys, tokens, or credentials ever committed
- **Input validation** in every IPC handler before data reaches services
- Keep components in `src/renderer/src/components/`, services in `src/main/services/`

---

## Commit Messages

Use conventional commit format:

```
feat: add timeline export to PDF
fix: handle undefined note.id on create
refactor: extract correlation engine to separate module
docs: update README with new graph instructions
```

---

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Questions

Open a [GitHub Discussion](https://github.com/osint-intell/Axiom/discussions) for anything not covered here.
