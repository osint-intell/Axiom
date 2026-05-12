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

const mapEntity = (row) => ({
  ...row,
  confidence: Number(row.confidence ?? 0),
  metadata: parseJsonField(row.metadata, {})
})

const normalize = (value) => sanitizeText(value).toLowerCase()
const extractDomain = (value) => {
  const normalized = normalize(value)
  if (!normalized) return ''
  if (normalized.includes('@')) return normalized.split('@').pop() || ''
  return normalized.replace(/^https?:\/\//, '').split('/')[0]
}

const getIpRange = (value) => {
  const parts = normalize(value).split('.')
  return parts.length === 4 ? parts.slice(0, 3).join('.') : ''
}

const levenshtein = (a = '', b = '') => {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row])
  for (let column = 0; column <= a.length; column += 1) {
    matrix[0][column] = column
  }
  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      const cost = a[column - 1] === b[row - 1] ? 0 : 1
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      )
    }
  }
  return matrix[b.length][a.length]
}

const usernameCore = (value) => normalize(value).replace(/[^a-z0-9]/g, '')
const similarityScore = (left, right) => {
  if (!left || !right) return 0
  const distance = levenshtein(left, right)
  const longest = Math.max(left.length, right.length)
  return Math.max(0, Math.round((1 - distance / longest) * 100))
}

const inferSuggestionType = (reasons) => {
  if (reasons.some((reason) => reason.includes('Exact value'))) return 'duplicate_of'
  if (reasons.some((reason) => reason.includes('domain'))) return 'same_domain'
  if (reasons.some((reason) => reason.includes('IP range'))) return 'same_network'
  if (reasons.some((reason) => reason.includes('username'))) return 'alias_of'
  return 'associated_with'
}

export const entityService = {
  getAll() {
    const db = getDatabase()
    return db.prepare(`
      SELECT e.*, i.title AS investigation_title
      FROM entities e
      LEFT JOIN investigations i ON i.id = e.investigation_id
      ORDER BY datetime(e.created_at) DESC
    `).all().map(mapEntity)
  },

  getByInvestigation(investigationId) {
    const db = getDatabase()
    return db.prepare(`
      SELECT e.*, i.title AS investigation_title
      FROM entities e
      LEFT JOIN investigations i ON i.id = e.investigation_id
      WHERE e.investigation_id = ?
      ORDER BY datetime(e.created_at) DESC
    `).all(investigationId).map(mapEntity)
  },

  create(data = {}) {
    const db = getDatabase()
    const entity = {
      id: uuidv4(),
      investigation_id: sanitizeText(data.investigation_id),
      type: sanitizeText(data.type, 'username') || 'username',
      value: sanitizeText(data.value),
      label: sanitizeText(data.label) || sanitizeText(data.value),
      metadata: JSON.stringify(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {}),
      confidence: Math.max(0, Math.min(100, Number(data.confidence ?? 50))),
      created_at: new Date().toISOString()
    }

    if (!entity.investigation_id || !entity.value) {
      throw new Error('Entities require an investigation and a value.')
    }

    db.prepare(`
      INSERT INTO entities (id, investigation_id, type, value, label, metadata, confidence, created_at)
      VALUES (@id, @investigation_id, @type, @value, @label, @metadata, @confidence, @created_at)
    `).run(entity)

    return db.prepare('SELECT * FROM entities WHERE id = ?').get(entity.id)
  },

  update(id, data = {}) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM entities WHERE id = ?').get(id)
    if (!existing) {
      throw new Error('Entity not found.')
    }

    const mergedMetadata = {
      ...parseJsonField(existing.metadata, {}),
      ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {})
    }

    db.prepare(`
      UPDATE entities
      SET type = ?,
          value = ?,
          label = ?,
          metadata = ?,
          confidence = ?
      WHERE id = ?
    `).run(
      sanitizeText(data.type, existing.type) || existing.type,
      sanitizeText(data.value, existing.value) || existing.value,
      sanitizeText(data.label, existing.label) || existing.label,
      JSON.stringify(mergedMetadata),
      Math.max(0, Math.min(100, Number(data.confidence ?? existing.confidence ?? 50))),
      id
    )

    return db.prepare('SELECT * FROM entities WHERE id = ?').get(id)
  },

  delete(id) {
    const db = getDatabase()
    db.prepare('DELETE FROM relationships WHERE source_id = ? OR target_id = ?').run(id, id)
    return db.prepare('DELETE FROM entities WHERE id = ?').run(id).changes > 0
  },

  correlate(entityData = {}) {
    const { username = '', alias = '', email = '', domain = '', phone = '', ip = '' } = entityData
    const inputCount = [username, alias, email, domain, phone, ip].filter((v) => v?.trim()).length
    if (inputCount === 0) return { confidence: 0, reasons: [], suggestions: [] }

    // ── Phase 1: Input introspection (works even with empty database) ─────────
    const intrinsicReasons = []
    let intrinsicScore = 0

    // IP analysis
    if (ip?.trim()) {
      const cleanIp = normalize(ip)
      const octets = cleanIp.split('.')
      const isValidIpv4 = octets.length === 4 && octets.every((o) => !Number.isNaN(Number(o)) && Number(o) >= 0 && Number(o) <= 255)
      if (isValidIpv4) {
        intrinsicScore += 15
        intrinsicReasons.push(`Valid IPv4 address: ${cleanIp}`)
        const range = octets.slice(0, 3).join('.')
        intrinsicReasons.push(`Network range: ${range}.0/24`)
        const first = Number(octets[0])
        const second = Number(octets[1])
        const isPrivate = first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) || first === 127
        if (isPrivate) {
          intrinsicReasons.push('Private/internal IP — likely LAN or loopback address')
        } else {
          intrinsicScore += 5
          intrinsicReasons.push('Public IP address — potentially traceable to ASN/ISP/geolocation')
        }
      } else {
        intrinsicReasons.push(`Input "${ip}" does not match valid IPv4 format`)
      }
    }

    // Email analysis
    if (email?.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const cleanEmail = email.trim()
      if (emailPattern.test(cleanEmail)) {
        intrinsicScore += 20
        const atIndex = cleanEmail.indexOf('@')
        const localPart = cleanEmail.slice(0, atIndex)
        const emailDomain = cleanEmail.slice(atIndex + 1)
        intrinsicReasons.push(`Valid email format: "${cleanEmail}"`)
        intrinsicReasons.push(`Local part: "${localPart}" | Provider domain: ${emailDomain}`)
        const knownProviders = {
          'gmail.com': 'Google/Gmail (high coverage platform)',
          'yahoo.com': 'Yahoo Mail',
          'outlook.com': 'Microsoft Outlook',
          'hotmail.com': 'Microsoft Hotmail',
          'protonmail.com': 'ProtonMail — encrypted/privacy-focused',
          'proton.me': 'Proton.me — encrypted/privacy-focused',
          'tutanota.com': 'Tutanota — zero-knowledge encrypted',
          'cock.li': 'cock.li — anonymous/disposable service',
          'mailinator.com': 'Mailinator — temporary/throwaway email',
          'guerrillamail.com': 'Guerrilla Mail — temporary email',
          'yandex.com': 'Yandex Mail (RU-origin)',
          'mail.ru': 'Mail.ru (RU-origin)'
        }
        if (knownProviders[emailDomain]) {
          intrinsicScore += 5
          intrinsicReasons.push(`Provider identified: ${knownProviders[emailDomain]}`)
        }
        // Cross-field: email domain vs domain field
        if (domain?.trim() && normalize(emailDomain) === normalize(domain.trim().replace(/^https?:\/\//, ''))) {
          intrinsicScore += 25
          intrinsicReasons.push('Cross-field match — email domain matches provided domain: strong same-identity signal')
        }
        // Cross-field: email local part vs username/alias
        const localCore = usernameCore(localPart)
        for (const uname of [username, alias].filter(Boolean)) {
          if (localCore && localCore === usernameCore(uname)) {
            intrinsicScore += 20
            intrinsicReasons.push(`Cross-field match — email local part matches ${username === uname ? 'username' : 'alias'} "${uname}": high-confidence same-identity`)
          }
        }
      } else {
        intrinsicReasons.push(`Email "${email}" does not match valid format — may be partial or obfuscated`)
      }
    }

    // Username / alias analysis
    for (const [field, value] of [['username', username], ['alias', alias]]) {
      if (!value?.trim()) continue
      intrinsicScore += 10
      const core = usernameCore(value)
      intrinsicReasons.push(`${field === 'username' ? 'Username' : 'Alias'} detected: "${value}" (${core.length}-char alphanumeric core)`)
      if (/\d+$/.test(value.trim())) {
        intrinsicReasons.push(`Numeric suffix in "${value}" — common pattern in multi-platform account variants`)
      }
      if (value.includes('_') || value.includes('-') || value.includes('.')) {
        intrinsicReasons.push(`Separator character in "${value}" — may appear stripped or differently on other platforms`)
      }
      if (core.length <= 4) {
        intrinsicReasons.push(`Short username core "${core}" — high reuse probability across platforms`)
      }
    }

    // Cross-field: username vs alias similarity
    if (username?.trim() && alias?.trim()) {
      const sim = similarityScore(usernameCore(username), usernameCore(alias))
      if (sim >= 60) {
        intrinsicScore += 15
        intrinsicReasons.push(`Username "${username}" and alias "${alias}" are ${sim}% similar — possible same-identity aliases`)
      }
    }

    // Domain analysis
    if (domain?.trim()) {
      intrinsicScore += 10
      const cleanDomain = normalize(domain.trim()).replace(/^https?:\/\//, '').split('/')[0]
      const parts = cleanDomain.split('.')
      const tld = parts.at(-1) || ''
      intrinsicReasons.push(`Domain: ${cleanDomain}`)
      const darkTlds = ['onion', 'i2p', 'bit', 'loki']
      if (darkTlds.includes(tld)) {
        intrinsicScore += 10
        intrinsicReasons.push(`.${tld} TLD — anonymized or darknet-accessible domain`)
      }
      if (parts.length > 2) {
        intrinsicReasons.push(`Subdomain detected: "${parts.slice(0, -2).join('.')}" — may indicate hosting infrastructure`)
      }
    }

    // Phone analysis
    if (phone?.trim()) {
      intrinsicScore += 8
      const cleanPhone = phone.trim().replace(/[\s\-().]/g, '')
      intrinsicReasons.push(`Phone number: "${phone.trim()}"`)
      if (cleanPhone.startsWith('+')) {
        intrinsicReasons.push(`International format — country code: ${cleanPhone.slice(0, 3)}`)
      }
      if (/^(555)/.test(cleanPhone.replace(/^\+?1/, ''))) {
        intrinsicReasons.push('555-prefix detected — potentially fictitious number')
      }
    }

    // Multi-vector richness bonus
    if (inputCount >= 4) {
      intrinsicScore += 20
      intrinsicReasons.push(`High-density input (${inputCount} identifiers) — multi-vector correlation enabled`)
    } else if (inputCount === 3) {
      intrinsicScore += 12
      intrinsicReasons.push(`Multi-vector input (${inputCount} identifiers) — moderate correlation confidence`)
    } else if (inputCount === 2) {
      intrinsicScore += 6
      intrinsicReasons.push(`Dual-vector input (${inputCount} identifiers provided)`)
    }

    const cappedIntrinsic = Math.min(85, intrinsicScore)

    // ── Phase 2: Database cross-reference ─────────────────────────────────────
    const candidates = this.getAll()
    const normalizedInputs = [username, alias, email, domain, phone, ip].map(normalize).filter(Boolean)
    const inputDomain = extractDomain(email || domain)
    const inputUsernames = [username, alias, email].map((v) => usernameCore(v?.split('@')[0])).filter(Boolean)
    const inputRange = getIpRange(ip)

    const dbMatches = candidates.map((entity) => {
      const matchReasons = []
      let matchScore = 0
      const entityValue = normalize(entity.value)
      const entityDomain = extractDomain(entity.value)
      const entityRange = getIpRange(entity.value)
      const entityUsername = usernameCore(entity.value.split('@')[0])

      if (normalizedInputs.includes(entityValue)) {
        matchScore += 55
        matchReasons.push(`Exact match: "${entity.value}" found in investigation "${entity.investigation_title}"`)
      }
      if (inputDomain && entityDomain && inputDomain === entityDomain) {
        matchScore += 20
        matchReasons.push(`Shared domain ${entityDomain} with entity in "${entity.investigation_title}"`)
      }
      if (inputRange && entityRange && inputRange === entityRange) {
        matchScore += 18
        matchReasons.push(`Shared IP subnet ${entityRange}.x with entity in "${entity.investigation_title}"`)
      }
      for (const u of inputUsernames) {
        const sim = similarityScore(u, entityUsername)
        if (sim >= 70) {
          matchScore += Math.round(sim / 5)
          matchReasons.push(`${sim}% username similarity to "${entity.value}" in "${entity.investigation_title}"`)
          break
        }
      }
      if (entity.investigation_id && sanitizeText(entityData.investigation_id) && entity.investigation_id === sanitizeText(entityData.investigation_id)) {
        matchScore += 8
        matchReasons.push('Entity shares same investigation context')
      }
      return { entity, confidence: Math.min(100, matchScore), reasons: matchReasons }
    }).filter((m) => m.reasons.length > 0)

    const suggestions = dbMatches
      .map((match) => ({
        id: match.entity.id,
        type: inferSuggestionType(match.reasons),
        label: match.entity.label || match.entity.value,
        value: match.entity.value,
        investigation_id: match.entity.investigation_id,
        investigation_title: match.entity.investigation_title,
        confidence: match.confidence,
        reasons: [...new Set(match.reasons)]
      }))
      .sort((a, b) => b.confidence - a.confidence)

    const dbBoost = suggestions.length > 0 ? Math.round(suggestions[0].confidence * 0.25) : 0
    const totalConfidence = Math.min(100, cappedIntrinsic + dbBoost)
    const allReasons = [...new Set([...intrinsicReasons, ...suggestions.flatMap((s) => s.reasons)])]

    return { confidence: totalConfidence, reasons: allReasons, suggestions }
  }
}
