# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest (`main`) | ✅ Active |
| Older releases | ❌ Not supported |

We recommend always running the latest version from the `main` branch or the most recent release.

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue in Axiom, please report it privately:

1. Go to the [Security tab](https://github.com/osint-intell/Axiom/security/advisories/new) on GitHub and open a private advisory
2. Include a clear description of the vulnerability, steps to reproduce, and potential impact
3. We will acknowledge receipt within **72 hours** and provide an estimated fix timeline

Please do not disclose the vulnerability publicly until we have released a patch.

---

## Scope

The following are in scope for security reports:

- **Electron main process**: IPC handler injection, unsafe `shell.openExternal`, path traversal via IPC params
- **Preload bridge**: contextBridge exposure of dangerous APIs, IPC channel spoofing
- **File import**: arbitrary file read via evidence import, path traversal in import handlers
- **Database**: SQLite injection via unsanitized inputs
- **Renderer**: XSS via `dangerouslySetInnerHTML`, `eval`, or injected script execution

The following are **out of scope**:

- Vulnerabilities in third-party `node_modules` not directly controllable by this codebase
- Physical access attacks or OS-level privilege escalation
- Social engineering of the end user

---

## Security Architecture

Axiom is built with Electron security best practices:

| Control | Status |
|---|---|
| `contextIsolation` | `true` |
| `nodeIntegration` | `false` |
| Renderer Node access | None — all via `window.axiom` preload bridge |
| IPC input validation | UUID and type checks on all mutation handlers |
| File paths returned to renderer | Filenames only — no absolute system paths |
| `eval` / `new Function` | Not used |
| Remote code execution | Not possible by design |
| Content Security Policy | Enforced in renderer HTML shell |

---

## Responsible Disclosure

We follow coordinated disclosure. Once a fix is released, we will credit the reporter (if desired) in the release notes.
