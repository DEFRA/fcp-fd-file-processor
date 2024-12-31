import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

import { pdf } from '../../mocks/files'

jest.setTimeout(30000)

jest.unstable_mockModule('../../../app/repos/dmz', () => ({
  addObject: jest.fn(),
  deleteObject: jest.fn(),
  getAvScanStatus: jest.fn()
}))

const originalEnv = process.env
process.env.AV_SCAN_POLLING_INTERVAL = 50

const { addObject, getAvScanStatus } = await import('../../../app/repos/dmz')
const { handleFileUpload } = await import('../../../app/services/upload')

describe('file upload service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should upload a file to the DMZ', async () => {
    addObject.mockResolvedValue('0230964f-ee67-4c70-920e-84847200140d/af173eb1-e1dc-44dc-ab51-ff8a817371b2')

    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    getAvScanStatus.mockResolvedValue({
      status: 'CLEAN_FILE',
      time: '2024-12-23 17:00:23Z'
    })

    await handleFileUpload(data, 'application/pdf', metadata)

    expect(addObject).toHaveBeenCalledWith(data, 'application/pdf', metadata)
  })

  test('should throw an error if the file upload fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    addObject.mockRejectedValue(new Error('Failed to upload file'))

    await expect(handleFileUpload(data, 'application/pdf', metadata)).rejects.toThrow('Failed to upload file')
  })

  test('should log error if getAvScanStatus fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')

    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const mockError = new Error('Failed to get AV scan status')

    const id = '0230964f-ee67-4c70-920e-84847200140d/af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    addObject.mockResolvedValue(id)
    getAvScanStatus.mockRejectedValue(mockError)

    await handleFileUpload(data, 'application/pdf', metadata)

    expect(addObject).toHaveBeenCalledWith(data, 'application/pdf', metadata)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`An error occurred while polling AV scan status for ${id}:`, mockError)
  })

  afterAll(() => {
    process.env = originalEnv
  })
})
