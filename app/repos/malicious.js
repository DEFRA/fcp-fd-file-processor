import { containers } from '../storage/blob/malicious.js'
import { uploadBlob } from '../storage/blob/common.js'

const { objects: quarantinedObjects } = containers

const quarantineObject = async (file, path, attributes) => {
  await uploadBlob(quarantinedObjects, file, path, attributes)

  return path
}

export {
  quarantineObject
}
