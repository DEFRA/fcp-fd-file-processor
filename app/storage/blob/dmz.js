import { DefaultAzureCredential } from '@azure/identity'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

import { storage } from '../../config/index.js'

const getCredential = () => {
  if (storage.get('dmz.accessKey')) {
    return new StorageSharedKeyCredential(
      storage.get('dmz.accountName'),
      storage.get('dmz.accessKey')
    )
  }

  return new DefaultAzureCredential({ managedIdentityClientId: storage.get('managedIdentityClientId') })
}

const endpoint = storage.get('blob.endpoint').replace('?', storage.get('dmz.accountName'))

export const dmz = new BlobServiceClient(
  endpoint,
  getCredential()
)
