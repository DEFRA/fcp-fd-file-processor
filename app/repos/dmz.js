import { snakeCase } from 'change-case/keys'

import { validateBlobPath } from '../utils/storage.js'
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

const getBlobTags = async (blob) => {
  try {
    const { tags } = await blob.getTags()

    return tags
  } catch (err) {
    console.error('An error occurred while getting tags:', err)

    throw err
  }
}

const addObject = async (file, contentType, metadata) => {
  const path = `${crypto.randomUUID()}/${crypto.randomUUID()}`

  const blob = objects.getBlockBlobClient(path)

  const parsedMetadata = snakeCase(metadata)

  for (const key of Object.keys(parsedMetadata)) {
    parsedMetadata[key] = parsedMetadata[key].toString()
  }

  try {
    await blob.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: contentType
      },
      metadata: parsedMetadata
    })
  } catch (err) {
    console.error('An error occurred while adding to DMZ:', err)

    throw err
  }

  return path
}

const deleteObject = async (path) => {
  validateBlobPath(path)

  try {
    const blob = objects.getBlockBlobClient(path)

    await blob.deleteIfExists()
  } catch (err) {
    console.error('An error occurred while deleting from DMZ:', err)

    throw err
  }
}

const getAvScanStatus = async (path) => {
  validateBlobPath(path)

  const blob = objects.getBlockBlobClient(path)

  const tags = await getBlobTags(blob)

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
