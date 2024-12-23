import { containers } from '../storage/blob/dmz.js'

const { objects } = containers

const addObject = async (file, contentType) => {
  const folderName = crypto.randomUUID()
  const blobName = crypto.randomUUID()

  const path = `${folderName}/${blobName}`

  const blob = objects.getBlockBlobClient(path)

  await blob.uploadData(file, {
    blobHTTPHeaders: {
      blobContentType: contentType
    }
  })

  return path
}

export {
  addObject
}
