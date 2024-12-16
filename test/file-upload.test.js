import FormData from 'form-data'
import { createServer } from '../app/server/server.js'
import blobStorage from '../app/storage/blob-storage.js'
import storageConfig from '../app/config/storage.js'

let server
const url = '/upload'

describe('upload files to blob storage', () => {
  // Helper function
  const getInboundFileList = async (folder) => {
    const containerClient = blobStorage.blobServiceClient.getContainerClient(storageConfig.get('container'))
    const fileList = []
    for await (const blob of containerClient.listBlobsFlat({ prefix: folder })) {
      fileList.push(blob.name.replace(`${folder}/`, ''))
    }
    return fileList
  }

  const streamToBuffer = async (readableStream) => {
    const chunks = []
    for await (const chunk of readableStream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }
  const cleanupBlobs = async (folder) => {
    const containerClient = blobStorage.blobServiceClient.getContainerClient(storageConfig.get('container'))
    for await (const blob of containerClient.listBlobsFlat({ prefix: folder })) {
      const blobClient = containerClient.getBlockBlobClient(blob.name)
      await blobClient.delete()
    }
  }
  const validateBlobContent = async (blobClient, expectedContent) => {
    const downloadResponse = await blobClient.download()
    const downloadedBuffer = await streamToBuffer(downloadResponse.readableStreamBody)
    const fileContent = downloadedBuffer.toString()
    expect(fileContent).toBe(expectedContent)
  }
  // End of helper functions
  beforeAll(async () => {
    await blobStorage.connectToBlob()
    server = await createServer()
    await server.start()
  })
  beforeEach(async () => {
    await cleanupBlobs(storageConfig.get('folder'))
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('should upload a file successfully', async () => {
    const form = new FormData()
    form.append('files', Buffer.from('hello world'), 'whatever.txt')

    const options = {
      method: 'POST',
      url,
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getBuffer().length
      },
      payload: form.getBuffer()
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('should upload multiple files and check if they exist in blob storage', async () => {
    const form = new FormData()
    form.append('files', Buffer.from('file one content'), 'file1.txt')
    form.append('files', Buffer.from('file two content'), 'file2.txt')

    const options = {
      method: 'POST',
      url,
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getBuffer().length
      },
      payload: form.getBuffer()
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    const result = response.result
    const metadata1 = result[0].metadata
    const metadata2 = result[1].metadata
    const blobClient1 = result[0].blockBlobClient
    const blobClient2 = result[1].blockBlobClient

    // Validate files are present in blob storage
    const fileList = await getInboundFileList(storageConfig.get('folder'))
    expect(fileList).toHaveLength(2)
    expect(metadata1.filename).toBe('file1.txt')
    expect(metadata2.filename).toBe('file2.txt')
    await validateBlobContent(blobClient1, 'file one content')
    await validateBlobContent(blobClient2, 'file two content')
  }
  )
})
