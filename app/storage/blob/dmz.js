import { BlobServiceClient } from '@azure/storage-blob'

import { storage } from '../../config/index.js'
import { getStorageCredential, getStorageEndpoint } from '../../utils/storage.js'

const endpoint = getStorageEndpoint(
  storage.get('blob.endpoint'),
  storage.get('dmz.accountName')
)

const credential = getStorageCredential(
  storage.get('dmz.accountName'),
  storage.get('dmz.accessKey')
)

export const dmz = new BlobServiceClient(
  endpoint,
  credential
)
