import crypto from 'crypto'

const buildCleanFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source: 'fcp-fd-file-processor',
    type: 'uk.gov.fcp.sfd.file.clean.v1',
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: 'application/json',
  source: 'fcp-fd-file-processor'
})

const buildMaliciousFileMessage = (id, metadata) => ({
  body: {
    specversion: '1.0.2',
    id: crypto.randomUUID(),
    source: 'fcp-fd-file-processor',
    type: 'uk.gov.fcp.sfd.file.malicious.v1',
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  },
  type: 'application/json',
  source: 'fcp-fd-file-processor'
})

export { buildCleanFileMessage, buildMaliciousFileMessage }
