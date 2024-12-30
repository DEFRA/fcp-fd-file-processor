import storage from '../config/storage.js'

import {
  AV_SCAN_TIMEOUT,
  CLEAN_FILE,
  MALICIOUS_FILE
} from '../constants/av-results.js'

import {
  addObject as addDmzObject,
  getAvScanStatus
} from '../repos/dmz.js'

import { addObject as addCleanObject } from '../repos/clean.js'
import { addObject as addMalObject } from '../repos/malicious.js'

const avPollingInterval = storage.get('dmz.avScanPollingInterval')
const avScanMaxAttempts = storage.get('dmz.avScanMaxAttempts')

const waitForAvScan = async (id, interval) => {
  let avResult
  let attempts = 0

  do {
    try {
      avResult = await getAvScanStatus(id)
    } catch (err) {
      console.error(`An error occurred while polling AV scan status for ${id}:`, err)
    }

    if (!avResult) {
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    attempts += 1
  } while (!avResult && attempts < avScanMaxAttempts)

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

const uploadFile = async (file, contentType, metadata) => {
  try {
    const id = await addDmzObject(file, contentType, metadata)

    return id
  } catch (err) {
    console.error('An error occurred while uploading to DMZ:', err)

    throw err
  }
}

const moveToCleanStorage = async (id, file, contentType, metadata) => {
  try {
    await addCleanObject(file, contentType, metadata, id)
  } catch (err) {
    console.error('An error occurred while moving to clean storage:', err)
    throw err
  }
}

const moveToQuarantine = async (id, file, contentType, metadata) => {
  try {
    await addMalObject(file, contentType, metadata, id)
  } catch (err) {
    console.error('An error occurred while moving to quarantine:', err)
    throw err
  }
}

const handleFileUpload = async (file, contentType, metadata) => {
  const id = await uploadFile(file, contentType, metadata)

  try {
    await waitForAvScan(id, avPollingInterval)

    console.log(`AV scan passed. Moving ${id} to clean storage.`)
    await moveToCleanStorage(id, file, contentType, metadata)
  } catch (err) {
    if (err.cause === MALICIOUS_FILE) {
      console.log(`Uploaded file ${id} has been identified as malicious. Moving to quarantine.`)
      await moveToQuarantine(id, file, contentType, metadata)
    }

    return [null, err]
  } finally {
    console.log(`Deleting file ${id} from DMZ`)
  }

  return [id, null]
}

export {
  handleFileUpload
}
