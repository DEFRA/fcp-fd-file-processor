import convict from 'convict'

import isProd from '../utils/is-prod.js'

const storage = convict({
  blob: {
    endpoint: {
      doc: 'Azure Blob Storage Endpoint',
      format: String,
      default: process.env.USE_AZURITE === 'true'
        ? `${process.env.AZURITE_BLOB_ENDPOINT}/?`
        : 'https://?.blob.core.windows.net',
    }
  },
  managedIdentityClientId: {
    doc: 'Managed Identity Client ID',
    format: String,
    nullable: !isProd(),
    default: null,
    env: 'MANAGED_IDENTITY_CLIENT_ID'
  },
  dmz: {
    accountName: {
      doc: 'DMZ Azure Storage Account Name',
      format: String,
      default: null,
      env: 'DMZ_STORAGE_ACCOUNT_NAME'
    },
    accessKey: {
      doc: 'DMZ Azure Storage Account Access Key - Should only be used in local development',
      format: String,
      nullable: true,
      default: null,
      env: process.env.USE_AZURITE === 'true'
        ? 'AZURITE_ACCESS_KEY'
        : 'DMZ_STORAGE_ACCESS_KEY'
    }
  },
  emulator: {
    useEmulator: {
      doc: 'Use Azure Storage Emulator',
      format: Boolean,
      default: false,
      env: 'USE_AZURITE'
    },
    endpoint: {
      doc: 'Azurite Blob Endpoint',
      format: String,
      default: null,
      env: 'AZURITE_BLOB_ENDPOINT'
    }
  }
})

storage.validate({ allowed: 'strict' })

export default storage
