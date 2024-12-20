import { storage } from '../config/index.js'

const getStorageEndpoint = (endpoint, accountName) => {
  return endpoint.replace('?', accountName)
}

const getStorageCredential = (accountName, accessKey) => {
  if (accessKey) {
    return new StorageSharedKeyCredential(
      accountName,
      accessKey
    )
  }

  return new DefaultAzureCredential({ managedIdentityClientId: storage.get('managedIdentityClientId') })
}

export {
  getStorageEndpoint,
  getStorageCredential
}
