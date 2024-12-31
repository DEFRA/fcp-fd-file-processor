import { validateBlobPath } from '../utils/storage.js'
import { containers } from '../storage/blob/clean.js'
import { uploadBlob, deleteBlob } from '../storage/blob/common.js'

const { objects: cleanObjects } = containers

const addObject = async (file, path, attributes) => {
  validateBlobPath(path)

  await uploadBlob(cleanObjects, file, path, attributes)

  return path
}

const deleteObject = async (path) => {
  validateBlobPath(path)

  await deleteBlob(cleanObjects, path)
}

export {
  addObject,
  deleteObject
}
