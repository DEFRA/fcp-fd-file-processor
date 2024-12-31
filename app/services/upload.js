import storage from '../config/storage.js'

import {
  AV_SCAN_TIMEOUT,
  CLEAN_FILE,
  MALICIOUS_FILE
} from '../constants/av-results.js'

import * as dmzRepo from '../repos/dmz.js'
import * as cleanRepo from '../repos/clean.js'
import * as maliciousRepo from '../repos/malicious.js'

const avPollingInterval = storage.get('dmz.avScanPollingInterval')
const avScanMaxAttempts = storage.get('dmz.avScanMaxAttempts')

const waitForAvScan = async (id, interval) => {
  let avResult
  let attempts = 0

  while (!avResult && attempts < avScanMaxAttempts) {
    try {
      avResult = await dmzRepo.getAvScanStatus(id)
    } catch (err) {
      console.error(`An error occurred while polling AV scan status for ${id}:`, err)
    }

    if (!avResult) {
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    attempts += 1
  }

  if (!avResult) {
    throw new Error(`AV scan for ${id} timed out after ${attempts} attempts`, { cause: AV_SCAN_TIMEOUT })
  }

  switch (avResult.status) {
    case CLEAN_FILE:
      return avResult
    case MALICIOUS_FILE:
      throw new Error('Uploaded file has been identified as malicious', { cause: MALICIOUS_FILE })
    default:
      throw new Error('An error occurred while scanning the uploaded file', { cause: avResult.status })
  }
}

const handleFileUpload = async (file, contentType, metadata) => {
  const attributes = {
    contentType,
    metadata
  }

  const path = await dmzRepo.addObject(file, attributes)

  try {
    await waitForAvScan(path, avPollingInterval)
    console.log(`AV scan passed. Moving ${path} to clean storage.`)

    await cleanRepo.addObject(file, path, attributes)
  } catch (err) {
    if (err.cause === MALICIOUS_FILE) {
      console.warn(`Uploaded file ${path} has been identified as malicious. Moving to quarantine.`)
      await maliciousRepo.quarantineObject(file, path, attributes)

      return [null, err]
    }

    throw err
  } finally {
    console.log(`Deleting file ${path} from DMZ`)
    await dmzRepo.deleteObject(path)
  }

  return [path, null]
}

export {
  handleFileUpload
}
