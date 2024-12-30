import { snakeCase } from 'change-case/keys'

import { containers } from '../storage/blob/clean.js'

const { objects } = containers

const addObject = async (file, contentType, metadata, path) => {
  const components = path?.split('/')

  if (!path || components.length !== 2) {
    throw new Error('Path is required. Path must be in the format of folder/filename')
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

export {
  addObject,
  deleteObject
}
