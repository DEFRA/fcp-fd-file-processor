import crypto from 'crypto'
import source from '../../constants/source.js'

const buildCleanFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source,
    type: 'uk.gov.fcp.sfd.file.clean.v1',
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: 'CloudEvent',
  source
})

const buildMaliciousFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source,
    type: 'uk.gov.fcp.sfd.file.malicious.v1',
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: 'CloudEvent',
  source
})

export { buildCleanFileMessage, buildMaliciousFileMessage }
