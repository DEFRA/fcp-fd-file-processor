import convict from 'convict'

const getStorageEndpoint = () => {
  if (process.env.USE_AZURITE === 'true') {
    return process.env.AZURITE_ACCESS_KEY
  }

  return '.blob.core.windows.net'
}

const storage = convict({
  blob: {
    endpoint: {
      doc: 'Azure Storage Endpoint',
      format: String,
      nullable: false,
      default: getStorageEndpoint()
    }
  },
  dmz: {
    accountName: {
      doc: 'DMZ Azure Storage Account Name',
      format: String,
      default: 'dmz',
      env: 'DMZ_STORAGE_ACCOUNT_NAME'
    },
    accessKey: {
      doc: 'DMZ Azure Storage Access Key',
      format: String,
      nullable: true,
      default: null,
      env: process.env.USE_AZURITE === 'true' ? 'AZURITE_ACCESS_KEY' : 'DMZ_STORAGE_ACCESS_KEY'
    }
  },
  emulator: {
    enabled: {
      doc: 'Use Azure Storage Emulator',
      format: Boolean,
      default: false,
      env: 'USE_AZURITE'
    }
  }
})

storage.validate({ allowed: 'strict' })

export default storage
