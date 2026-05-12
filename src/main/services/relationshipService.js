import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './databaseService'

const sanitizeText = (value, fallback = '') => String(value ?? fallback).replace(/\0/g, '').trim()

const mapRelationship = (row) => ({
  ...row,
  strength: Number(row.strength ?? 0)
})

export const relationshipService = {
  getAll() {
    const db = getDatabase()
    return db.prepare(`
      SELECT
        r.*,
        se.value AS source_value,
        se.label AS source_label,
        te.value AS target_value,
        te.label AS target_label
      FROM relationships r
      LEFT JOIN entities se ON se.id = r.source_id
      LEFT JOIN entities te ON te.id = r.target_id
      ORDER BY datetime(r.created_at) DESC
    `).all().map(mapRelationship)
  },

  create(data = {}) {
    const db = getDatabase()
    const relationship = {
      id: uuidv4(),
      source_id: sanitizeText(data.source_id),
      target_id: sanitizeText(data.target_id),
      type: sanitizeText(data.type, 'associated_with') || 'associated_with',
      label: sanitizeText(data.label),
      strength: Number(data.strength ?? 50),
      created_at: new Date().toISOString()
    }

    if (!relationship.source_id || !relationship.target_id) {
      throw new Error('Relationships require both source and target entities.')
    }

    db.prepare(`
      INSERT INTO relationships (id, source_id, target_id, type, label, strength, created_at)
      VALUES (@id, @source_id, @target_id, @type, @label, @strength, @created_at)
    `).run(relationship)

    return db.prepare('SELECT * FROM relationships WHERE id = ?').get(relationship.id)
  },

  delete(id) {
    const db = getDatabase()
    return db.prepare('DELETE FROM relationships WHERE id = ?').run(id).changes > 0
  },

  getByEntity(entityId) {
    const db = getDatabase()
    return db.prepare(`
      SELECT *
      FROM relationships
      WHERE source_id = ? OR target_id = ?
      ORDER BY datetime(created_at) DESC
    `).all(entityId, entityId).map(mapRelationship)
  }
}
