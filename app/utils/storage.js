import { StorageSharedKeyCredential } from '@azure/storage-blob'
import isProd from '../utils/is-prod.js'
import { storage } from '../config/index.js'

import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity'

if (isProd()) {
  storage.hooks = {
    beforeConnect: async (cfg) => {
      const credential = new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID })
      const tokenProvider = getBearerTokenProvider(credential, 'https://ossrdbms-aad.database.windows.net/.default')
      cfg.password = tokenProvider
    }
  }
}

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

export {
  getStorageEndpoint,
  getStorageCredential
}
