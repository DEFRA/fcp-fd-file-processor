import { BlobServiceClient } from '@azure/storage-blob'

import { storageConfig } from '../../config/index.js'
import { getStorageEndpoint, getStorageCredential } from '../../utils/storage.js'

const endpoint = getStorageEndpoint(
  storageConfig.get('endpoint.blob'),
  storageConfig.get('malicious.accountName')
)

const credential = getStorageCredential(
  storageConfig.get('malicious.accountName'),
  storageConfig.get('malicious.accessKey')
)

const client = new BlobServiceClient(
  endpoint,
  credential
)

const containers = {
  objects: client.getContainerClient(storageConfig.get('container.objects'))
}

const createMalContainers = async () => {
  for (const container of Object.keys(containers)) {
    await containers[container].createIfNotExists()
  }
}

export {
  client,
  containers,
  createMalContainers
}
