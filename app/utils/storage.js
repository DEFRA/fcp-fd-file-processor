import { StorageSharedKeyCredential } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'

import { storage } from '../config/index.js'

const getStorageEndpoint = (endpoint, accountName) => {
  return endpoint.replace('?', accountName)
}

const getStorageCredential = (accountName, accessKey) => {
  if (accessKey) {
    console.log('Using Azure Storage Shared Key Credential for account:', accountName)

    return new StorageSharedKeyCredential(
      accountName,
      accessKey
    )
  }

  console.log('Using Azure Identity Credential for account:', accountName)

  return new DefaultAzureCredential({ managedIdentityClientId: storage.get('managedIdentityClientId') })
}

const validateBlobPath = (path) => {
  if (!path) {
    throw new Error('Path is required.')
  }

  const components = path.split('/')

  if (components.length !== 2) {
    throw new Error('Path must be in the format of folder/filename')
  }
}

export {
  getStorageEndpoint,
  getStorageCredential,
  validateBlobPath
}
