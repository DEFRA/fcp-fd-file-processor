import { BlobServiceClient } from '@azure/storage-blob'

import { storage } from '../../config/index.js'
import { getStorageEndpoint, getStorageCredential } from '../../utils/storage.js'

const endpoint = getStorageEndpoint(
  storage.get('endpoint.blob'),
  storage.get('dmz.accountName')
)

const credential = getStorageCredential(
  storage.get('dmz.accountName'),
  storage.get('dmz.accessKey')
)

const client = new BlobServiceClient(
  endpoint,
  credential
)

const containers = {
  objects: client.getContainerClient(storage.get('container.objects'))
}

const createDmzContainers = async () => {
  for (const container of Object.keys(containers)) {
    await containers[container].createIfNotExists()
  }
}

export {
  client,
  containers,
  createDmzContainers
}
