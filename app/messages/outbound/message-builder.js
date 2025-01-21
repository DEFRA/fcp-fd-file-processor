import crypto from 'crypto'
import { SOURCE } from '../../constants/source.js'
import { METADATA_CLEAN_TYPE, METADATA_MALICIOUS_TYPE } from '../../constants/metadata-type.js'

const buildCleanFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source: SOURCE,
    type: METADATA_CLEAN_TYPE,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: METADATA_CLEAN_TYPE,
  source: SOURCE
})

const buildMaliciousFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source: SOURCE,
    type: METADATA_MALICIOUS_TYPE,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: METADATA_MALICIOUS_TYPE,
  source: SOURCE
})

export { buildCleanFileMessage, buildMaliciousFileMessage }
