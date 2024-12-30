import { snakeCase } from 'change-case/keys'

import { containers } from '../storage/blob/dmz.js'
import { CLEAN_FILE, MALICIOUS_FILE } from '../constants/av-results.js'

const { objects } = containers

const parseAvStatus = (status) => {
  switch (status) {
    case 'No threats found':
      return CLEAN_FILE
    case 'Malicious':
      return MALICIOUS_FILE
    default:
      return status.split(':')[0]
  }
}

const addObject = async (file, contentType, metadata, path) => {
  path = path ?? `${crypto.randomUUID()}/${crypto.randomUUID()}`

  const components = path.split('/')

  if (components.length !== 2) {
    throw new Error('Invalid path. Path must be in the format of folder/filename')
  }

  const blob = objects.getBlockBlobClient(path)

  const parsedMetadata = snakeCase(metadata)

  for (const key of Object.keys(parsedMetadata)) {
    parsedMetadata[key] = parsedMetadata[key].toString()
  }

  await blob.uploadData(file, {
    blobHTTPHeaders: {
      blobContentType: contentType
    },
    metadata: parsedMetadata
  })

  return path
}

const deleteObject = async (path) => {
  const blob = objects.getBlockBlobClient(path)

  await blob.deleteIfExists()
}

const getAvScanStatus = async (path) => {
  const blob = objects.getBlockBlobClient(path)

  const { tags } = await blob.getTags()

  const raw = tags['Malware Scanning scan result']
  const time = tags['Malware Scanning scan time UTC']

  if (!raw) {
    return null
  }

  const status = parseAvStatus(raw)

  return {
    status,
    time
  }
}

export {
  addObject,
  deleteObject,
  getAvScanStatus
}
