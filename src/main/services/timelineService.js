import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './databaseService'

const sanitizeText = (value, fallback = '') => String(value ?? fallback).replace(/\0/g, '').trim()

export const timelineService = {
  getAll() {
    const db = getDatabase()
    return db.prepare(`
      SELECT t.*, e.label AS entity_label, ev.title AS evidence_title
      FROM timeline_events t
      LEFT JOIN entities e ON e.id = t.entity_id
      LEFT JOIN evidence ev ON ev.id = t.evidence_id
      ORDER BY datetime(t.event_date) DESC
    `).all()
  },

  getByInvestigation(investigationId) {
    const db = getDatabase()
    return db.prepare(`
      SELECT t.*, e.label AS entity_label, ev.title AS evidence_title
      FROM timeline_events t
      LEFT JOIN entities e ON e.id = t.entity_id
      LEFT JOIN evidence ev ON ev.id = t.evidence_id
      WHERE t.investigation_id = ?
      ORDER BY datetime(t.event_date) DESC
    `).all(investigationId)
  },

  create(data = {}) {
    const db = getDatabase()
    const event = {
      id: uuidv4(),
      investigation_id: sanitizeText(data.investigation_id),
      entity_id: sanitizeText(data.entity_id),
      evidence_id: sanitizeText(data.evidence_id),
      title: sanitizeText(data.title) || 'Untitled Event',
      description: sanitizeText(data.description),
      event_date: sanitizeText(data.event_date) || new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    if (!event.investigation_id) {
      throw new Error('Timeline events require an investigation.')
    }

    db.prepare(`
      INSERT INTO timeline_events (id, investigation_id, entity_id, evidence_id, title, description, event_date, created_at)
      VALUES (@id, @investigation_id, @entity_id, @evidence_id, @title, @description, @event_date, @created_at)
    `).run(event)

    return db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(event.id)
  },

  update(id, data = {}) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(id)
    if (!existing) {
      throw new Error('Timeline event not found.')
    }

    db.prepare(`
      UPDATE timeline_events
      SET entity_id = ?,
          evidence_id = ?,
          title = ?,
          description = ?,
          event_date = ?
      WHERE id = ?
    `).run(
      sanitizeText(data.entity_id, existing.entity_id),
      sanitizeText(data.evidence_id, existing.evidence_id),
      sanitizeText(data.title, existing.title) || existing.title,
      sanitizeText(data.description, existing.description),
      sanitizeText(data.event_date, existing.event_date) || existing.event_date,
      id
    )

    return db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(id)
  },

  delete(id) {
    const db = getDatabase()
    return db.prepare('DELETE FROM timeline_events WHERE id = ?').run(id).changes > 0
  }
}
