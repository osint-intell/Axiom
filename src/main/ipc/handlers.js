import { dialog } from 'electron'
import { investigationService } from '../services/investigationService'
import { entityService } from '../services/entityService'
import { relationshipService } from '../services/relationshipService'
import { evidenceService } from '../services/evidenceService'
import { timelineService } from '../services/timelineService'
import { notesService } from '../services/notesService'
import { settingsService } from '../services/settingsService'
import path from 'node:path'

const unwrapData = (payload) => (payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload)

// Strip home directory from any path before returning to renderer
const safeDisplayPath = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return null
  return path.basename(filePath)
}

// Only allow UUID-shaped IDs through IPC to prevent path traversal via ID params
const isValidId = (id) => typeof id === 'string' && /^[0-9a-f-]{8,64}$/i.test(id.trim())

export function registerIpcHandlers(ipcMain) {
  ipcMain.handle('investigations:getAll', () => investigationService.getAll())
  ipcMain.handle('investigations:getById', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return investigationService.getById(id)
  })
  ipcMain.handle('investigations:create', (_, data) => investigationService.create(unwrapData(data)))
  ipcMain.handle('investigations:update', (_, id, data) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return investigationService.update(id, unwrapData(data))
  })
  ipcMain.handle('investigations:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return investigationService.delete(id)
  })
  ipcMain.handle('investigations:getStats', () => investigationService.getStats())

  ipcMain.handle('entities:getAll', () => entityService.getAll())
  ipcMain.handle('entities:getByInvestigation', (_, investigationId) => {
    if (!isValidId(investigationId)) throw new Error('Invalid ID.')
    return entityService.getByInvestigation(investigationId)
  })
  ipcMain.handle('entities:create', (_, data) => entityService.create(unwrapData(data)))
  ipcMain.handle('entities:update', (_, id, data) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return entityService.update(id, unwrapData(data))
  })
  ipcMain.handle('entities:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return entityService.delete(id)
  })
  ipcMain.handle('entities:correlate', (_, data) => entityService.correlate(unwrapData(data)))

  ipcMain.handle('relationships:getAll', () => relationshipService.getAll())
  ipcMain.handle('relationships:create', (_, data) => relationshipService.create(unwrapData(data)))
  ipcMain.handle('relationships:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return relationshipService.delete(id)
  })
  ipcMain.handle('relationships:getByEntity', (_, entityId) => {
    if (!isValidId(entityId)) throw new Error('Invalid ID.')
    return relationshipService.getByEntity(entityId)
  })

  ipcMain.handle('evidence:getAll', () => evidenceService.getAll())
  ipcMain.handle('evidence:getByInvestigation', (_, investigationId) => {
    if (!isValidId(investigationId)) throw new Error('Invalid ID.')
    return evidenceService.getByInvestigation(investigationId)
  })
  ipcMain.handle('evidence:create', (_, data) => evidenceService.create(unwrapData(data)))
  ipcMain.handle('evidence:update', (_, id, data) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return evidenceService.update(id, unwrapData(data))
  })
  ipcMain.handle('evidence:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return evidenceService.delete(id)
  })

  // File path is NEVER accepted from the renderer — always opened via system dialog in main process
  ipcMain.handle('evidence:importFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Evidence',
      properties: ['openFile'],
      filters: [{ name: 'Evidence Files', extensions: ['txt', 'json', 'md', 'png', 'jpg', 'jpeg'] }]
    })

    if (canceled || !filePaths?.length) return null

    const result = evidenceService.importFile(filePaths[0])
    if (!result) return null

    // Strip absolute path — renderer only receives the filename, not the full system path
    return { ...result, file_path: safeDisplayPath(result.file_path) }
  })

  ipcMain.handle('timeline:getAll', () => timelineService.getAll())
  ipcMain.handle('timeline:getByInvestigation', (_, investigationId) => {
    if (!isValidId(investigationId)) throw new Error('Invalid ID.')
    return timelineService.getByInvestigation(investigationId)
  })
  ipcMain.handle('timeline:create', (_, data) => timelineService.create(unwrapData(data)))
  ipcMain.handle('timeline:update', (_, id, data) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return timelineService.update(id, unwrapData(data))
  })
  ipcMain.handle('timeline:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return timelineService.delete(id)
  })

  ipcMain.handle('notes:getAll', () => notesService.getAll())
  ipcMain.handle('notes:getByInvestigation', (_, investigationId) => {
    if (!isValidId(investigationId)) throw new Error('Invalid ID.')
    return notesService.getByInvestigation(investigationId)
  })
  ipcMain.handle('notes:create', (_, data) => notesService.create(unwrapData(data)))
  ipcMain.handle('notes:update', (_, id, data) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return notesService.update(id, unwrapData(data))
  })
  ipcMain.handle('notes:delete', (_, id) => {
    if (!isValidId(id)) throw new Error('Invalid ID.')
    return notesService.delete(id)
  })

  ipcMain.handle('settings:get', (_, key) => settingsService.get(key))
  ipcMain.handle('settings:set', (_, key, value) => {
    if (typeof key !== 'string' || key.length > 128) throw new Error('Invalid settings key.')
    return settingsService.set(key, value)
  })
  // Return only filename — never expose absolute system paths to renderer
  ipcMain.handle('settings:exportDb', async (_, payload) => {
    const result = await settingsService.exportDb(payload)
    return safeDisplayPath(result)
  })
  ipcMain.handle('settings:importDb', async () => {
    const result = await settingsService.importDb()
    return safeDisplayPath(result)
  })
}
