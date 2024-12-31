import { snakeCase } from 'change-case/keys'

import { validateBlobPath } from '../utils/storage.js'
import { containers } from '../storage/blob/clean.js'

const { objects } = containers

const addObject = async (file, contentType, metadata, path) => {
  validateBlobPath(path)

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
    console.error('An error occurred while adding to clean storage:', err)

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
    console.error('An error occurred while deleting from clean storage:', err)

    throw err
  }
}

export {
  addObject,
  deleteObject
}
