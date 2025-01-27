import { beforeAll, describe, expect, jest, test } from '@jest/globals'

import * as dmzStorage from '../../../../app/storage/blob/dmz.js'
import * as cleanStorage from '../../../../app/storage/blob/clean.js'
import * as malStorage from '../../../../app/storage/blob/malicious.js'

import FormData from 'form-data'
import { randomUUID } from 'crypto'

import { pdf, png } from '../../../mocks/files.js'
import { getBlob } from '../../../helpers/blob.js'

const { containers: dmzContainers } = dmzStorage
const { containers: cleanContainers } = cleanStorage
const { containers: malContainers } = malStorage

const dmzRepo = await import('../../../../app/repos/dmz.js')

const mockAvResult = {}

const updateBlobTagStub = jest.fn(async (path) => {
  const client = dmzContainers.objects.getBlockBlobClient(path)

  if (mockAvResult.result && mockAvResult.time) {
    await client.setTags({
      'Malware Scanning scan result': mockAvResult.result,
      'Malware Scanning scan time UTC': mockAvResult.time
    })
  }

  return dmzRepo.getAvScanStatus(path)
})

jest.unstable_mockModule('../../../../app/repos/dmz', () => ({
  ...dmzRepo,
  getAvScanStatus: updateBlobTagStub
}))

jest.unstable_mockModule('../../../../app/messages/outbound/publish', () => ({
  publishCleanFileEvent: jest.fn(),
  publishMaliciousFileEvent: jest.fn()
}))

const { publishCleanFileEvent, publishMaliciousFileEvent } = await import('../../../../app/messages/outbound/publish.js')

const consoleLogSpy = jest.spyOn(console, 'log')
const consoleWarnSpy = jest.spyOn(console, 'warn')
const consoleErrorSpy = jest.spyOn(console, 'error')

const { createServer } = await import('../../../../app/server.js')

jest.setTimeout(30000)

describe('objects endpoint', () => {
  let server

  beforeAll(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()

    await dmzStorage.createDmzContainers()
    await cleanStorage.createCleanContainers()
    await malStorage.createMalContainers()
  })

  describe('POST /objects', () => {
    test('should upload a file if the request is valid', async () => {
      const uuidSpy = jest.spyOn(crypto, 'randomUUID')

      uuidSpy.mockReturnValue('89e047f4-89e0-47b5-ad85-ed4688734290')

      mockAvResult.result = 'No threats found'
      mockAvResult.time = '2024-12-23 17:00:23Z'

      const formData = new FormData()

      formData.append('file', pdf, 'agreement.pdf')
      formData.append('sbi', '123456789')
      formData.append('sourceSystem', 'test')
      formData.append('documentType', 'agreement')

      const response = await server.inject({
        method: 'POST',
        url: '/objects',
        payload: formData.getBuffer(),
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getBuffer().length
        }
      })

      const expectedMetadata = {
        filename: 'agreement.pdf',
        sbi: 123456789,
        sourceSystem: 'test',
        documentType: 'agreement'
      }

      expect(response.statusCode).toBe(201)

      expect(response.result).toEqual({
        objectId: '89e047f4-89e0-47b5-ad85-ed4688734290'
      })

      await expect(getBlob(dmzContainers.objects, response.result.objectId)).rejects.toThrow('The specified blob does not exist.')

      expect(publishCleanFileEvent).toHaveBeenCalledWith('89e047f4-89e0-47b5-ad85-ed4688734290', expectedMetadata)

      const cleanBlob = await getBlob(cleanContainers.objects, response.result.objectId)

      expect(cleanBlob.properties.contentType).toBe('application/pdf')

      expect(cleanBlob.buffer).toEqual(pdf)

      expect(consoleLogSpy).toHaveBeenCalledWith(`AV scan passed. Moving ${response.result.objectId} to clean storage.`)
    })

    test('should return 400 if the request is invalid', async () => {
      mockAvResult.result = 'No threats found'
      mockAvResult.time = '2024-12-23 17:00:23Z'

      const formData = new FormData()

      const response = await server.inject({
        method: 'POST',
        url: '/objects',
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

    describe('AV scan results', () => {
      test('should return 400 if the file is malicious', async () => {
        const cryptoSpy = jest.spyOn(crypto, 'randomUUID')

        const generatedIds = []

        cryptoSpy.mockImplementation(() => {
          const uuid = randomUUID()

          generatedIds.push(uuid)

          return uuid
        })

        mockAvResult.result = 'Malicious'
        mockAvResult.time = '2024-12-23 17:00:23Z'

        const formData = new FormData()

        formData.append('file', pdf, 'agreement.pdf')
        formData.append('sbi', '123456789')
        formData.append('sourceSystem', 'test')
        formData.append('documentType', 'agreement')

        const response = await server.inject({
          method: 'POST',
          url: '/objects',
          payload: formData.getBuffer(),
          headers: {
            ...formData.getHeaders(),
            'Content-Length': formData.getBuffer().length
          }
        })

        expect(response.statusCode).toBe(400)

        expect(response.result).toEqual({
          errors: ['Uploaded file has been identified as malicious']
        })

        const id = generatedIds[0]

        const expectedMetadata = {
          filename: 'agreement.pdf',
          sbi: 123456789,
          sourceSystem: 'test',
          documentType: 'agreement'
        }

        expect(consoleWarnSpy).toHaveBeenCalledWith(`Uploaded file ${id} has been identified as malicious. Moving to quarantine.`)

        await expect(getBlob(dmzContainers.objects, id)).rejects.toThrow('The specified blob does not exist.')

        expect(publishMaliciousFileEvent).toHaveBeenCalledWith(id, expectedMetadata)

        const malBlob = await getBlob(malContainers.objects, id)

        expect(malBlob.properties.contentType).toBe('application/pdf')

        expect(malBlob.buffer).toEqual(pdf)

        cryptoSpy.mockRestore()
      })

      test('should return 500 if the AV scan times out', async () => {
        const cryptoSpy = jest.spyOn(crypto, 'randomUUID')

        mockAvResult.result = ''
        mockAvResult.time = ''

        const generatedIds = []

        cryptoSpy.mockImplementation(() => {
          const uuid = randomUUID()

          generatedIds.push(uuid)

          return uuid
        })

        const formData = new FormData()

        formData.append('file', pdf, 'agreement.pdf')
        formData.append('sbi', '123456789')
        formData.append('sourceSystem', 'test')
        formData.append('documentType', 'agreement')

        const response = await server.inject({
          method: 'POST',
          url: '/objects',
          payload: formData.getBuffer(),
          headers: {
            ...formData.getHeaders(),
            'Content-Length': formData.getBuffer().length
          }
        })

        expect(response.statusCode).toBe(500)

        const id = `${generatedIds[0]}/${generatedIds[1]}`

        await expect(getBlob(dmzContainers.objects, id)).rejects.toThrow('The specified blob does not exist.')

        expect(response.result).toEqual({
          error: 'Internal Server Error',
          message: 'An internal server error occurred',
          statusCode: 500
        })

        cryptoSpy.mockRestore()
      })

      test('should return 500 if an error occurs while uploading the file', async () => {
        const cryptoSpy = jest.spyOn(crypto, 'randomUUID')

        const generatedIds = []

        cryptoSpy.mockImplementation(() => {
          const uuid = randomUUID()

          generatedIds.push(uuid)

          return uuid
        })

        mockAvResult.result = 'SAM259201'
        mockAvResult.time = '2024-12-23 17:00:23Z'

        const formData = new FormData()

        formData.append('file', pdf, 'agreement.pdf')
        formData.append('sbi', '123456789')
        formData.append('sourceSystem', 'test')
        formData.append('documentType', 'agreement')

        const response = await server.inject({
          method: 'POST',
          url: '/objects',
          payload: formData.getBuffer(),
          headers: {
            ...formData.getHeaders(),
            'Content-Length': formData.getBuffer().length
          }
        })

        expect(response.statusCode).toBe(500)

        const id = `${generatedIds[0]}/${generatedIds[1]}`

        await expect(getBlob(dmzContainers.objects, id)).rejects.toThrow('The specified blob does not exist.')

        expect(response.result).toEqual({
          error: 'Internal Server Error',
          message: 'An internal server error occurred',
          statusCode: 500
        })

        cryptoSpy.mockRestore()
      })
    })

    describe('file type validation', () => {
      test('should return 415 if the content type is not supported', async () => {
        const formData = new FormData()

        formData.append('file', png, 'agreement.png')
        formData.append('sbi', '123456789')
        formData.append('sourceSystem', 'test')
        formData.append('documentType', 'agreement')

        const response = await server.inject({
          method: 'POST',
          url: '/objects',
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
          url: '/objects',
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
          url: '/objects',
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
  })

  afterEach(async () => {
    await dmzContainers.objects.deleteIfExists()
    await cleanContainers.objects.deleteIfExists()
    await malContainers.objects.deleteIfExists()

    await server.stop()
  })

  afterAll(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()

    jest.restoreAllMocks()
  })
})
