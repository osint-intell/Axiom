import fs from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './databaseService'

const SUPPORTED_EXTENSIONS = new Map([
  ['.txt', 'text'],
  ['.json', 'json'],
  ['.md', 'markdown'],
  ['.png', 'image'],
  ['.jpg', 'image'],
  ['.jpeg', 'image']
])

const parseJsonField = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const sanitizeText = (value, fallback = '') => String(value ?? fallback).replace(/\0/g, '').trim()
const sanitizePayload = (payload) => sanitizeText(payload).slice(0, 2000000)

const mapEvidence = (row) => ({
  ...row,
  tags: parseJsonField(row.tags, []),
  metadata: parseJsonField(row.metadata, {})
})

export const evidenceService = {
  getAll() {
    const db = getDatabase()
    return db.prepare(`
      SELECT ev.*, i.title AS investigation_title
      FROM evidence ev
      LEFT JOIN investigations i ON i.id = ev.investigation_id
      ORDER BY datetime(ev.created_at) DESC
    `).all().map(mapEvidence)
  },

  getByInvestigation(investigationId) {
    const db = getDatabase()
    return db.prepare(`
      SELECT ev.*, i.title AS investigation_title
      FROM evidence ev
      LEFT JOIN investigations i ON i.id = ev.investigation_id
      WHERE ev.investigation_id = ?
      ORDER BY datetime(ev.created_at) DESC
    `).all(investigationId).map(mapEvidence)
  },

  create(data = {}) {
    const db = getDatabase()
    const evidence = {
      id: uuidv4(),
      investigation_id: sanitizeText(data.investigation_id),
      type: sanitizeText(data.type, 'text') || 'text',
      title: sanitizeText(data.title) || 'Untitled Evidence',
      content: sanitizePayload(data.content),
      file_path: sanitizeText(data.file_path),
      tags: JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : []),
      metadata: JSON.stringify(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {}),
      created_at: new Date().toISOString()
    }

    if (!evidence.investigation_id) {
      throw new Error('Evidence must be attached to an investigation.')
    }

    db.prepare(`
      INSERT INTO evidence (id, investigation_id, type, title, content, file_path, tags, metadata, created_at)
      VALUES (@id, @investigation_id, @type, @title, @content, @file_path, @tags, @metadata, @created_at)
    `).run(evidence)

    return db.prepare('SELECT * FROM evidence WHERE id = ?').get(evidence.id)
  },

  update(id, data = {}) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM evidence WHERE id = ?').get(id)
    if (!existing) {
      throw new Error('Evidence item not found.')
    }

    const metadata = {
      ...parseJsonField(existing.metadata, {}),
      ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {})
    }

    db.prepare(`
      UPDATE evidence
      SET type = ?,
          title = ?,
          content = ?,
          file_path = ?,
          tags = ?,
          metadata = ?
      WHERE id = ?
    `).run(
      sanitizeText(data.type, existing.type) || existing.type,
      sanitizeText(data.title, existing.title) || existing.title,
      sanitizePayload(data.content ?? existing.content),
      sanitizeText(data.file_path, existing.file_path),
      JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : parseJsonField(existing.tags, [])),
      JSON.stringify(metadata),
      id
    )

    return db.prepare('SELECT * FROM evidence WHERE id = ?').get(id)
  },

  delete(id) {
    const db = getDatabase()
    return db.prepare('DELETE FROM evidence WHERE id = ?').run(id).changes > 0
  },

  importFile(filePath) {
    const resolvedPath = path.resolve(filePath)
    if (!fs.existsSync(resolvedPath)) {
      throw new Error('Selected evidence file does not exist.')
    }

    const stats = fs.statSync(resolvedPath)
    if (!stats.isFile()) {
      throw new Error('Only files can be imported as evidence.')
    }

    if (stats.size > 10 * 1024 * 1024) {
      throw new Error('Evidence imports are limited to 10 MB per file.')
    }

    const extension = path.extname(resolvedPath).toLowerCase()
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      throw new Error('Unsupported evidence file type. Allowed: txt, json, md, png, jpg, jpeg.')
    }

    const type = SUPPORTED_EXTENSIONS.get(extension)
    const metadata = {
      size: stats.size,
      extension,
      imported_at: new Date().toISOString()
    }

    let content = ''
    if (type === 'image') {
      const buffer = fs.readFileSync(resolvedPath)
      const mime = extension === '.png' ? 'image/png' : 'image/jpeg'
      content = `data:${mime};base64,${buffer.toString('base64')}`
      metadata.mime = mime
    } else {
      const raw = fs.readFileSync(resolvedPath, 'utf8')
      if (type === 'json') {
        const parsed = JSON.parse(raw)
        content = sanitizePayload(JSON.stringify(parsed, null, 2))
      } else {
        content = sanitizePayload(raw)
      }
    }

    return {
      title: path.basename(resolvedPath),
      type,
      content,
      file_path: resolvedPath,
      metadata
    }
  }
}
