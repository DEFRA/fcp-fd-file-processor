import { containers } from '../storage/blob/clean.js'
import { uploadBlob, deleteBlob } from '../storage/blob/common.js'

const { objects: cleanObjects } = containers

const addObject = async (file, path, attributes) => {
  await uploadBlob(cleanObjects, file, path, attributes)

  return path
}

const deleteObject = async (path) => {
  await deleteBlob(cleanObjects, path)
}

export {
  addObject,
  deleteObject
}
