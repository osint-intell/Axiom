import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './databaseService'

const parseJsonField = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const sanitizeText = (value, fallback = '') => String(value ?? fallback).replace(/\0/g, '').trim()

const mapNote = (row) => ({
  ...row,
  tags: parseJsonField(row.tags, []),
  linked_entities: parseJsonField(row.linked_entities, [])
})

export const notesService = {
  getAll() {
    const db = getDatabase()
    return db.prepare(`
      SELECT n.*, i.title AS investigation_title
      FROM notes n
      LEFT JOIN investigations i ON i.id = n.investigation_id
      ORDER BY datetime(n.updated_at) DESC
    `).all().map(mapNote)
  },

  getByInvestigation(investigationId) {
    const db = getDatabase()
    return db.prepare(`
      SELECT n.*, i.title AS investigation_title
      FROM notes n
      LEFT JOIN investigations i ON i.id = n.investigation_id
      WHERE n.investigation_id = ?
      ORDER BY datetime(n.updated_at) DESC
    `).all(investigationId).map(mapNote)
  },

  create(data = {}) {
    const db = getDatabase()
    const now = new Date().toISOString()
    const note = {
      id: uuidv4(),
      investigation_id: sanitizeText(data.investigation_id),
      title: sanitizeText(data.title) || 'Untitled Note',
      content: String(data.content ?? '').replace(/\0/g, ''),
      tags: JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : []),
      linked_entities: JSON.stringify(Array.isArray(data.linked_entities) ? data.linked_entities.filter(Boolean) : []),
      created_at: now,
      updated_at: now
    }

    if (!note.investigation_id) {
      throw new Error('Notes require an investigation.')
    }

    db.prepare(`
      INSERT INTO notes (id, investigation_id, title, content, tags, linked_entities, created_at, updated_at)
      VALUES (@id, @investigation_id, @title, @content, @tags, @linked_entities, @created_at, @updated_at)
    `).run(note)

    return db.prepare('SELECT * FROM notes WHERE id = ?').get(note.id)
  },

  update(id, data = {}) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
    if (!existing) {
      throw new Error('Note not found.')
    }

    db.prepare(`
      UPDATE notes
      SET title = ?,
          content = ?,
          tags = ?,
          linked_entities = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      sanitizeText(data.title, existing.title) || existing.title,
      String(data.content ?? existing.content ?? '').replace(/\0/g, ''),
      JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : parseJsonField(existing.tags, [])),
      JSON.stringify(Array.isArray(data.linked_entities) ? data.linked_entities.filter(Boolean) : parseJsonField(existing.linked_entities, [])),
      new Date().toISOString(),
      id
    )

    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  },

  delete(id) {
    const db = getDatabase()
    return db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes > 0
  }
}
