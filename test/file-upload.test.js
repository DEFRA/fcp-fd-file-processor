import FormData from 'form-data'
import { createServer } from '../app/server/server.js'
import blobStorage from '../app/storage/blob-storage.js'

let server
const url = '/upload'
const form = new FormData()

describe('upload files to blob storage', () => {
  beforeAll(async () => {
    form.append('files', Buffer.from('hello world'), 'whatever.txt')
    await blobStorage.connectToBlob()
    server = await createServer()
    await server.start()
  })

  test('should upload a file successfully', async () => {
    const options = {
      method: 'POST',
      url,
      headers: {
        ...form.getHeaders(),
        'Content-Length': 0
      },
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })
})
