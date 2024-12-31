import { snakeCase } from 'change-case/keys'

import { validateBlobPath } from '../utils/storage.js'
import { containers } from '../storage/blob/malicious.js'

const { objects } = containers

const quarantineObject = async (file, contentType, metadata, path) => {
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
    console.error('An error occurred while adding to quarantine:', err)

    throw err
  }

  return path
}

export {
  quarantineObject
}
