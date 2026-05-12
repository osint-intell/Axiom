import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { app } from 'electron'

let db
let databasePath

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS investigations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT DEFAULT '',
    metadata TEXT DEFAULT '{}',
    confidence INTEGER DEFAULT 50,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT DEFAULT '',
    strength INTEGER DEFAULT 50,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL,
    entity_id TEXT DEFAULT '',
    evidence_id TEXT DEFAULT '',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    event_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    linked_entities TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_entities_investigation ON entities(investigation_id)',
  'CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id)',
  'CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id)',
  'CREATE INDEX IF NOT EXISTS idx_evidence_investigation ON evidence(investigation_id)',
  'CREATE INDEX IF NOT EXISTS idx_timeline_investigation ON timeline_events(investigation_id)',
  'CREATE INDEX IF NOT EXISTS idx_notes_investigation ON notes(investigation_id)'
]

export function initializeDatabase(force = false) {
  if (db && !force) {
    return db
  }

  const userDataPath = app.getPath('userData')
  fs.mkdirSync(userDataPath, { recursive: true })
  databasePath = path.join(userDataPath, 'axiom.db')

  db = new Database(databasePath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = OFF')

  for (const statement of schemaStatements) {
    db.exec(statement)
  }

  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)`)
    .run(
      'appearance:theme', 'dark',
      'graph:animations', 'true',
      'graph:layout', 'free',
      'app:version', app.getVersion(),
      'security:contextIsolation', 'true',
      'security:nodeIntegration', 'false'
    )

  return db
}

export function getDatabase() {
  if (!db) {
    return initializeDatabase()
  }

  return db
}

export function getDatabasePath() {
  if (!databasePath) {
    initializeDatabase()
  }

  return databasePath
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = undefined
  }
}

export function exportDatabase(destinationPath) {
  const activeDb = getDatabase()
  activeDb.pragma('wal_checkpoint(TRUNCATE)')
  const sourcePath = getDatabasePath()
  fs.copyFileSync(sourcePath, destinationPath)
  return destinationPath
}

export function importDatabase(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    throw new Error('Database import source file was not found.')
  }

  closeDatabase()
  fs.copyFileSync(sourcePath, getDatabasePath())
  initializeDatabase(true)
  return getDatabasePath()
}

export default getDatabase
