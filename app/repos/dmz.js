import { snakeCase } from 'change-case/keys'

import { containers } from '../storage/blob/dmz.js'

const { objects } = containers

const addObject = async (file, contentType, metadata) => {
  const folderName = crypto.randomUUID()
  const blobName = crypto.randomUUID()

  const path = `${folderName}/${blobName}`

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

export {
  addObject
}
