import { BlobServiceClient } from '@azure/storage-blob'

import { storageConfig } from '../../config/index.js'
import { getStorageEndpoint, getStorageCredential } from '../../utils/storage.js'

const endpoint = getStorageEndpoint(
  storageConfig.get('endpoint.blob'),
  storageConfig.get('clean.accountName')
)

const credential = getStorageCredential(
  storageConfig.get('clean.accountName'),
  storageConfig.get('clean.accessKey')
)

const client = new BlobServiceClient(
  endpoint,
  credential
)

const containers = {
  objects: client.getContainerClient(storageConfig.get('container.objects'))
}

const createCleanContainers = async () => {
  for (const container of Object.keys(containers)) {
    await containers[container].createIfNotExists()
  }
}

export {
  client,
  containers,
  createCleanContainers
}
