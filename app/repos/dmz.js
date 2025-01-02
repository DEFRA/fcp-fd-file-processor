import { containers } from '../storage/blob/dmz.js'
import { AV_SCAN_TIMEOUT, CLEAN_FILE, MALICIOUS_FILE } from '../constants/av-results.js'
import { uploadBlob, getBlobTags, deleteBlob } from '../storage/blob/common.js'
import storage from '../config/storage.js'

const { objects } = containers

const avPollingInterval = storage.get('dmz.avScanPollingInterval')
const avScanMaxAttempts = storage.get('dmz.avScanMaxAttempts')

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
  const path = crypto.randomUUID()

  await uploadBlob(objects, file, path, attributes)

  return path
}

const deleteObject = async (path) => {
  await deleteBlob(objects, path)
}

const getAvScanStatus = async (path) => {
  let avResult
  let attempts = 0

  while (!avResult && attempts < avScanMaxAttempts) {
    try {
      const tags = await getBlobTags(objects, path)

      const raw = tags['Malware Scanning scan result']

      avResult = raw ? parseAvStatus(raw) : null
    } catch (err) {
      console.error(`An error occurred while polling AV scan status for ${path}:`, err)
    }

    if (!avResult) {
      await new Promise(resolve => setTimeout(resolve, avPollingInterval))
    }

    attempts += 1
  }

  if (!avResult) {
    throw new Error(`AV scan for ${path} timed out after ${attempts} attempts`, { cause: AV_SCAN_TIMEOUT })
  }

  switch (avResult) {
    case CLEAN_FILE:
      return avResult
    case MALICIOUS_FILE:
      throw new Error('Uploaded file has been identified as malicious', { cause: MALICIOUS_FILE })
    default:
      throw new Error('An error occurred while scanning the uploaded file', { cause: avResult })
  }
}

export {
  addObject,
  deleteObject,
  getAvScanStatus
}
