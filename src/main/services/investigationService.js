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

const mapInvestigation = (row) => ({
  ...row,
  tags: parseJsonField(row.tags, []),
  entity_count: Number(row.entity_count ?? 0),
  evidence_count: Number(row.evidence_count ?? 0),
  note_count: Number(row.note_count ?? 0),
  timeline_count: Number(row.timeline_count ?? 0)
})

export const investigationService = {
  getAll() {
    const db = getDatabase()
    const rows = db.prepare(`
      SELECT
        i.*,
        (SELECT COUNT(*) FROM entities e WHERE e.investigation_id = i.id) AS entity_count,
        (SELECT COUNT(*) FROM evidence ev WHERE ev.investigation_id = i.id) AS evidence_count,
        (SELECT COUNT(*) FROM notes n WHERE n.investigation_id = i.id) AS note_count,
        (SELECT COUNT(*) FROM timeline_events t WHERE t.investigation_id = i.id) AS timeline_count
      FROM investigations i
      ORDER BY datetime(i.updated_at) DESC
    `).all()

    return rows.map(mapInvestigation)
  },

  getById(id) {
    const db = getDatabase()
    const row = db.prepare(`
      SELECT
        i.*,
        (SELECT COUNT(*) FROM entities e WHERE e.investigation_id = i.id) AS entity_count,
        (SELECT COUNT(*) FROM evidence ev WHERE ev.investigation_id = i.id) AS evidence_count,
        (SELECT COUNT(*) FROM notes n WHERE n.investigation_id = i.id) AS note_count,
        (SELECT COUNT(*) FROM timeline_events t WHERE t.investigation_id = i.id) AS timeline_count
      FROM investigations i
      WHERE i.id = ?
    `).get(id)

    return row ? mapInvestigation(row) : null
  },

  create(data = {}) {
    const db = getDatabase()
    const now = new Date().toISOString()
    const investigation = {
      id: uuidv4(),
      title: sanitizeText(data.title) || 'Untitled Investigation',
      description: sanitizeText(data.description),
      status: sanitizeText(data.status, 'active') || 'active',
      priority: sanitizeText(data.priority, 'medium') || 'medium',
      tags: JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : []),
      created_at: now,
      updated_at: now
    }

    db.prepare(`
      INSERT INTO investigations (id, title, description, status, priority, tags, created_at, updated_at)
      VALUES (@id, @title, @description, @status, @priority, @tags, @created_at, @updated_at)
    `).run(investigation)

    return this.getById(investigation.id)
  },

  update(id, data = {}) {
    const existing = this.getById(id)
    if (!existing) {
      throw new Error('Investigation not found.')
    }

    const db = getDatabase()
    const updated = {
      id,
      title: sanitizeText(data.title, existing.title) || existing.title,
      description: sanitizeText(data.description, existing.description),
      status: sanitizeText(data.status, existing.status) || existing.status,
      priority: sanitizeText(data.priority, existing.priority) || existing.priority,
      tags: JSON.stringify(Array.isArray(data.tags) ? data.tags.filter(Boolean).map((tag) => sanitizeText(tag)) : existing.tags),
      updated_at: new Date().toISOString()
    }

    db.prepare(`
      UPDATE investigations
      SET title = @title,
          description = @description,
          status = @status,
          priority = @priority,
          tags = @tags,
          updated_at = @updated_at
      WHERE id = @id
    `).run(updated)

    return this.getById(id)
  },

  delete(id) {
    const db = getDatabase()
    const entityIds = db.prepare('SELECT id FROM entities WHERE investigation_id = ?').all(id).map((row) => row.id)

    const transaction = db.transaction(() => {
      for (const entityId of entityIds) {
        db.prepare('DELETE FROM relationships WHERE source_id = ? OR target_id = ?').run(entityId, entityId)
      }

      db.prepare('DELETE FROM entities WHERE investigation_id = ?').run(id)
      db.prepare('DELETE FROM evidence WHERE investigation_id = ?').run(id)
      db.prepare('DELETE FROM timeline_events WHERE investigation_id = ?').run(id)
      db.prepare('DELETE FROM notes WHERE investigation_id = ?').run(id)
      return db.prepare('DELETE FROM investigations WHERE id = ?').run(id)
    })

    const result = transaction()
    return result.changes > 0
  },

  getStats() {
    const db = getDatabase()
    return {
      investigations: db.prepare('SELECT COUNT(*) AS count FROM investigations').get().count,
      active: db.prepare(`SELECT COUNT(*) AS count FROM investigations WHERE status = 'active'`).get().count,
      completed: db.prepare(`SELECT COUNT(*) AS count FROM investigations WHERE status = 'completed'`).get().count,
      critical: db.prepare(`SELECT COUNT(*) AS count FROM investigations WHERE priority = 'critical'`).get().count,
      archived: db.prepare(`SELECT COUNT(*) AS count FROM investigations WHERE status = 'archived'`).get().count
    }
  }
}
