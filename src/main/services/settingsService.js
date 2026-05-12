import fs from 'node:fs'
import path from 'node:path'
import { dialog } from 'electron'
import { exportDatabase, getDatabase, importDatabase } from './databaseService'

const sanitizeText = (value, fallback = '') => String(value ?? fallback).replace(/\0/g, '').trim()
const sanitizeFilename = (value, fallback) => sanitizeText(value, fallback).replace(/[<>:"/\\|?*]+/g, '-').slice(0, 120) || fallback

export const settingsService = {
  get(key) {
    const db = getDatabase()
    if (key) {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
      return row ? row.value : null
    }

    const rows = db.prepare('SELECT key, value FROM settings ORDER BY key ASC').all()
    return rows.reduce((accumulator, row) => {
      accumulator[row.key] = row.value
      return accumulator
    }, {})
  },

  set(key, value) {
    const db = getDatabase()
    const normalizedKey = sanitizeText(key)
    if (!normalizedKey) {
      throw new Error('A valid settings key is required.')
    }

    db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(normalizedKey, typeof value === 'string' ? value : JSON.stringify(value))

    return this.get(normalizedKey)
  },

  async exportDb(payload = {}) {
    if (payload && typeof payload === 'object' && 'content' in payload) {
      const defaultPath = path.join(process.env.USERPROFILE || process.cwd(), sanitizeFilename(payload.suggestedName, 'axiom-export.json'))
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Axiom Data',
        defaultPath,
        filters: [{ name: 'Supported Export', extensions: ['json', 'md'] }]
      })

      if (canceled || !filePath) {
        return null
      }

      const content = typeof payload.content === 'string' ? payload.content : JSON.stringify(payload.content, null, 2)
      fs.writeFileSync(filePath, content, 'utf8')
      return filePath
    }

    const defaultPath = path.join(process.env.USERPROFILE || process.cwd(), 'axiom-backup.db')
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Axiom Database',
      defaultPath,
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }]
    })

    if (canceled || !filePath) {
      return null
    }

    return exportDatabase(filePath)
  },

  async importDb() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Axiom Database',
      properties: ['openFile'],
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }]
    })

    if (canceled || !filePaths?.length) {
      return null
    }

    return importDatabase(filePaths[0])
  }
}
