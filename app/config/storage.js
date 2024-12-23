import convict from 'convict'

import isProd from '../utils/is-prod.js'

const storage = convict({
  endpoint: {
    blob: {
      doc: 'Azure Blob Storage Endpoint',
      format: String,
      default: process.env.USE_AZURITE === 'true'
        ? `${process.env.AZURITE_HOST}:${process.env.AZURITE_BLOB_PORT}/?`
        : 'https://?.blob.core.windows.net'
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
  container: {
    objects: {
      doc: 'Azure Blob Storage Object Container',
      format: String,
      default: 'objects',
      env: 'OBJECTS_CONTAINER_NAME'
    }
  },
  emulator: {
    useEmulator: {
      doc: 'Use Azure Storage Emulator',
      format: Boolean,
      default: false,
      env: 'USE_AZURITE'
    },
    host: {
      doc: 'Azurite host',
      format: String,
      nullable: process.env.USE_AZURITE !== 'true',
      default: null,
      env: 'AZURITE_HOST'
    },
    blobPort: {
      doc: 'Azurite blob port',
      format: Number,
      nullable: process.env.USE_AZURITE !== 'true',
      default: null,
      env: 'AZURITE_BLOB_PORT'
    }
  }
})

storage.validate({ allowed: 'strict' })

export default storage
