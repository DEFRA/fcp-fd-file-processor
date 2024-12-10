import { DefaultAzureCredential } from '@azure/identity'
import { BlobServiceClient } from '@azure/storage-blob'
import storageConfig from '../config/storage.js'
import { DEVELOPMENT } from '../constants/environments.js'

let blobServiceClient
let containersInitialised

const connectionStr = storageConfig.get('connectionStr')
console.log('Connection String:', connectionStr)

if (storageConfig.get('useConnectionStr')) {
  console.log('Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.get('connectionStr'))
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  console.log('Managed Identity Client Id:', storageConfig.get('managedIdentityClientId'))
  const credential = new DefaultAzureCredential({ managedIdentityClientId: storageConfig.get('managedIdentityClientId') })
  blobServiceClient = new BlobServiceClient(storageConfig.get('endpoint'), credential)
}

const container = blobServiceClient.getContainerClient(storageConfig.get('container'))

const initialiseFolders = async () => {
  const placeHolderText = 'Placeholder'
  const client = container.getBlockBlobClient(`${storageConfig.get('folder')}/default.txt`)
  await client.upload(placeHolderText, placeHolderText.length)
}

const initialiseContainers = async () => {
  if (storageConfig.createContainers) {
    console.log('Making sure blob containers exist')
    await container.createIfNotExists()
  }
  await initialiseFolders()
  containersInitialised = true
}

const getOutboundBlobClient = async (filename) => {
  if (!containersInitialised) {
    await initialiseContainers()
  }
  return container.getBlockBlobClient(`${storageConfig.get('folder')}/${filename}`)
}

const connectToBlob = async () => {
  try {
    if (process.env.NODE_ENV === DEVELOPMENT) {
      await initialiseContainers()
      console.log('Azurite infrastructure created successfully for local environment')
    } else {
      initialiseFolders()
      console.log('Containers are checked and ready to receive files')
    }
  } catch (error) {
    console.error('Error connecting to blob:', error.message)
  }
}

export default {
  blobServiceClient,
  initialiseContainers,
  getOutboundBlobClient,
  connectToBlob
}
