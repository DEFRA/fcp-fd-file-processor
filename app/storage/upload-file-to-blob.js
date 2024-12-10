import blobStorage from './blob-storage.js'
import { v4 as uuidv4 } from 'uuid'
import { storageConfig } from '../config/index.js'

const uploadFileToBlob = async (file, payload) => {
  const containerClient = blobStorage.blobServiceClient.getContainerClient(storageConfig.get('container'))
  const uniqueId = uuidv4()
  const blobName = `${storageConfig.get('folder')}/${uniqueId}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.uploadStream(file)

  const metadata = {
    filename: file.hapi.filename,
    blobReference: uniqueId,
    scheme: payload.scheme,
    sbi: payload.sbi,
    crn: payload.crn,
    collection: payload.collection
  }

  const blobMetadata = {
    filename: file.hapi.filename
  }
  await blockBlobClient.setMetadata(blobMetadata)

  return { blockBlobClient, metadata }
}

export default uploadFileToBlob
