import { describe, expect, jest, test } from '@jest/globals'
import FormData from 'form-data'

import { createServer } from '../../../../app/server'
import { containers } from '../../../../app/storage/blob/dmz'
import { pdf, png } from '../../../mocks/files'

jest.setTimeout(30000)

const { objects } = containers

describe('upload endpoint', () => {
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    await objects.createIfNotExists()
  })

  describe('POST /upload', () => {
    test('should upload a file if the request is valid', async () => {
      const formData = new FormData()

      formData.append('file', pdf, 'agreement.pdf')
      formData.append('sbi', '123456789')
      formData.append('sourceSystem', 'test')
      formData.append('documentType', 'agreement')

      const response = await server.inject({
        method: 'POST',
        url: '/upload',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getBuffer().length
        }
      })

      expect(response.statusCode).toBe(201)

      expect(response.result).toEqual({
        id: expect.any(String),
        metadata: {
          filename: 'agreement.pdf',
          contentType: 'application/pdf',
          sbi: 123456789,
          sourceSystem: 'test',
          documentType: 'agreement'
        }
      })

      const blobClient = objects.getBlockBlobClient(response.result.id)

      const metadata = await blobClient.getProperties()
      const blobResponse = await blobClient.downloadToBuffer()

      expect(metadata.contentType).toBe('application/pdf')
      expect(blobResponse).toEqual(pdf)
    })

    test('should return 400 if the request is invalid', async () => {
      const formData = new FormData()

      const response = await server.inject({
        method: 'POST',
        url: '/upload',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      })

      expect(response.statusCode).toBe(400)

      const { errors } = response.result

      expect(errors).toEqual(expect.arrayContaining([
        '"file" is required',
        '"sbi" is required',
        '"sourceSystem" is required',
        '"documentType" is required'
      ]))
    })

    test('should return 415 if the content type is not supported', async () => {
      const formData = new FormData()

      formData.append('file', png, 'agreement.png')
      formData.append('sbi', '123456789')
      formData.append('sourceSystem', 'test')
      formData.append('documentType', 'agreement')

      const response = await server.inject({
        method: 'POST',
        url: '/upload',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      })

      expect(response.statusCode).toBe(415)

      const { errors } = response.result

      expect(errors).toEqual([
        'Unsupported content type. Supported types are: [application/pdf]'
      ])
    })

    test('should return 400 if the expected file type does not match the detected file type', async () => {
      const formData = new FormData()

      formData.append('file', pdf, { filename: 'agreement.png', contentType: 'application/pdf' })
      formData.append('sbi', '123456789')
      formData.append('sourceSystem', 'test')
      formData.append('documentType', 'agreement')

      const response = await server.inject({
        method: 'POST',
        url: '/upload',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      })

      expect(response.statusCode).toBe(400)

      const { errors } = response.result

      expect(errors).toEqual([
        'Detected extension (.pdf) does not match the provided extension (.png)'
      ])
    })

    test('should return 400 if the expected content type does not match the detected content type', async () => {
      const formData = new FormData()

      formData.append('file', png, { filename: 'agreement.png', contentType: 'application/pdf' })
      formData.append('sbi', '123456789')
      formData.append('sourceSystem', 'test')
      formData.append('documentType', 'agreement')

      const response = await server.inject({
        method: 'POST',
        url: '/upload',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      })

      expect(response.statusCode).toBe(400)

      const { errors } = response.result

      expect(errors).toEqual([
        'Detected type (image/png) does not match the provided type (application/pdf)'
      ])
    })
  })

  afterEach(async () => {
    await objects.deleteIfExists()

    await server.stop()
  })
})
