import { validateBlobPath } from '../utils/storage.js'
import { containers } from '../storage/blob/dmz.js'
import { CLEAN_FILE, MALICIOUS_FILE } from '../constants/av-results.js'
import { uploadBlob, getBlobTags, deleteBlob } from '../storage/blob/common.js'

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

const addObject = async (file, attributes) => {
  const path = `${crypto.randomUUID()}/${crypto.randomUUID()}`

  await uploadBlob(objects, file, path, attributes)

  return path
}

const deleteObject = async (path) => {
  validateBlobPath(path)

  await deleteBlob(objects, path)
}

const getAvScanStatus = async (path) => {
  validateBlobPath(path)

  const tags = await getBlobTags(objects, path)

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
