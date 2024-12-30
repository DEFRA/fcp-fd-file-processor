import { BlobServiceClient } from '@azure/storage-blob'

import { storage } from '../../config/index.js'
import { getStorageEndpoint, getStorageCredential } from '../../utils/storage.js'

const endpoint = getStorageEndpoint(
  storage.get('endpoint.blob'),
  storage.get('malicious.accountName')
)

const credential = getStorageCredential(
  storage.get('malicious.accountName'),
  storage.get('malicious.accessKey')
)

const client = new BlobServiceClient(
  endpoint,
  credential
)

const containers = {
  objects: client.getContainerClient(storage.get('container.objects'))
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
