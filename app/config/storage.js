import convict from 'convict'
import { DEVELOPMENT, TEST, PRODUCTION } from '../constants/environments.js'

const storageConfig = convict({
  connectionStr: {
    doc: 'DMZ Storage account connection string',
    format: String,
    default: '',
    env: 'DMZ_STORAGE_CONNECTION_STRING'
  },
  storageAccount: {
    doc: 'DMZ Storage account name',
    format: String,
    default: '',
    env: 'DMZ_STORAGE_ACCOUNT_NAME'
  },
  container: {
    doc: 'Storage container name',
    format: String,
    default: 'test',
    env: 'STORAGE_CONTAINER'
  },
  folder: {
    doc: 'Folder name',
    format: String,
    default: 'files',
    env: 'STORAGE_FOLDER'
  },
  useConnectionStr: {
    doc: 'Flag to use connection string',
    format: Boolean,
    default: true,
    env: 'STORAGE_USE_CONNECTION_STRING'
  },
  createContainers: {
    doc: 'Flag to create containers',
    format: Boolean,
    default: true,
    env: 'STORAGE_CREATE_CONTAINERS'
  },
  endpoint: {
    doc: 'DMZ Storage account endpoint',
    format: String,
    default: '',
    env: 'DMZ_STORAGE_ACCOUNT_ENDPOINT'
  },
  managedIdentityClientId: {
    doc: 'Azure managed identity client ID',
    format: String,
    default: '',
    env: 'AZURE_CLIENT_ID'
  },
  isDev: {
    doc: 'Is development environment',
    format: Boolean,
    default: false
  },
  isTest: {
    doc: 'Is test environment',
    format: Boolean,
    default: false
  },
  isProd: {
    doc: 'Is production environment',
    format: Boolean,
    default: false
  }
})

storageConfig.load({
  isDev: process.env.NODE_ENV === DEVELOPMENT || process.env.NODE_ENV === TEST,
  isTest: process.env.NODE_ENV === TEST,
  isProd: process.env.NODE_ENV === PRODUCTION
})

storageConfig.validate({ allowed: 'strict' })

export default storageConfig
