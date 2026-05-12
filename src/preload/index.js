import { contextBridge, ipcRenderer } from 'electron'

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args)

contextBridge.exposeInMainWorld('axiom', {
  investigations: {
    getAll: () => invoke('investigations:getAll'),
    getById: (id) => invoke('investigations:getById', id),
    create: (data) => invoke('investigations:create', data),
    update: (id, data) => invoke('investigations:update', id, data),
    delete: (id) => invoke('investigations:delete', id),
    getStats: () => invoke('investigations:getStats')
  },
  entities: {
    getAll: () => invoke('entities:getAll'),
    getByInvestigation: (investigationId) => invoke('entities:getByInvestigation', investigationId),
    create: (data) => invoke('entities:create', data),
    update: (id, data) => invoke('entities:update', id, data),
    delete: (id) => invoke('entities:delete', id),
    correlate: (data) => invoke('entities:correlate', data)
  },
  relationships: {
    getAll: () => invoke('relationships:getAll'),
    create: (data) => invoke('relationships:create', data),
    delete: (id) => invoke('relationships:delete', id),
    getByEntity: (entityId) => invoke('relationships:getByEntity', entityId)
  },
  evidence: {
    getAll: () => invoke('evidence:getAll'),
    getByInvestigation: (investigationId) => invoke('evidence:getByInvestigation', investigationId),
    create: (data) => invoke('evidence:create', data),
    update: (id, data) => invoke('evidence:update', id, data),
    delete: (id) => invoke('evidence:delete', id),
    importFile: (filePath) => invoke('evidence:importFile', filePath)
  },
  timeline: {
    getAll: () => invoke('timeline:getAll'),
    getByInvestigation: (investigationId) => invoke('timeline:getByInvestigation', investigationId),
    create: (data) => invoke('timeline:create', data),
    update: (id, data) => invoke('timeline:update', id, data),
    delete: (id) => invoke('timeline:delete', id)
  },
  notes: {
    getAll: () => invoke('notes:getAll'),
    getByInvestigation: (investigationId) => invoke('notes:getByInvestigation', investigationId),
    create: (data) => invoke('notes:create', data),
    update: (id, data) => invoke('notes:update', id, data),
    delete: (id) => invoke('notes:delete', id)
  },
  settings: {
    get: (key) => invoke('settings:get', key),
    set: (key, value) => invoke('settings:set', key, value),
    exportDb: (payload) => invoke('settings:exportDb', payload),
    importDb: () => invoke('settings:importDb')
  }
})
