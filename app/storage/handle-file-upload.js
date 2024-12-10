import checkFileExtension from '../utils/file-checks/extension-check.js'
import uploadFileToBlob from './upload-file-to-blob.js'
import deleteBlob from './delete-blob.js'

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const pollBlobTags = async (blockBlobClient, maxAttempts = 10, interval = 1000) => {
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const response = await blockBlobClient.getTags()
    console.log('Polling for scan result:', response)
    const tags = response.blobTagSet.reduce((acc, tag) => {
      acc[tag.key] = tag.value
      return acc
    }, {})
    if (tags['Malware Scanning scan result']) {
      return tags['Malware Scanning scan result']
    }
    await timeout(interval)
  }
  throw new Error('Timeout waiting for scan result')
}

export const handleFileUpload = async (file, payload) => {
  let blockBlobClient
  try {
    console.log('File:', file)
    console.log('Payload:', payload)
    checkFileExtension(file.hapi.filename)
    const uploadResult = await uploadFileToBlob(file, payload)
    blockBlobClient = uploadResult.blockBlobClient

    const scanResult = await pollBlobTags(blockBlobClient)

    if (scanResult === 'Malicious') {
      throw new Error('Malicious file detected')
    } else if (scanResult !== 'No threats found') {
      throw new Error('Scan result unknown or not found')
    }
    return { message: 'File uploaded successfully', metadata: uploadResult.metadata }
  } catch (error) {
    if (blockBlobClient) {
      await deleteBlob(blockBlobClient)
    }
    return { error: `Failed to upload metadata, file: ${file.hapi.filename} is not saved. Reason: ${error.message}` }
  }
}

export default handleFileUpload
