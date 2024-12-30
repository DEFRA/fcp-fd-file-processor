import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { pdf } from '../../mocks/files'

jest.setTimeout(30000)

jest.unstable_mockModule('../../../app/repos/dmz', () => ({
  addObject: jest.fn(),
  deleteObject: jest.fn(),
  getAvScanStatus: jest.fn()
}))

jest.unstable_mockModule('../../../app/repos/malicious', () => ({
  addObject: jest.fn(),
  deleteObject: jest.fn()
}))

const { addObject: addDmzObject, getAvScanStatus } = await import('../../../app/repos/dmz')
const { addObject: addMalObject } = await import('../../../app/repos/malicious')
const { handleFileUpload } = await import('../../../app/services/upload')

describe('file upload service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should upload a file to the DMZ', async () => {
    addDmzObject.mockResolvedValue('0230964f-ee67-4c70-920e-84847200140d/af173eb1-e1dc-44dc-ab51-ff8a817371b2')

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

    expect(addDmzObject).toHaveBeenCalledWith(data, 'application/pdf', metadata)
  })

  test('should throw an error if the upload to DMZ fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')

    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const mockError = new Error('Failed to upload file')

    addDmzObject.mockRejectedValue(mockError)

    await expect(handleFileUpload(data, 'application/pdf', metadata)).rejects.toThrow(mockError.message)
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while uploading to DMZ:', mockError)
  })

  test('should move a file to quarantine if it is identified as malicious', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = '0230964f-ee67-4c70-920e-84847200140d/af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    addDmzObject.mockResolvedValue(id)

    getAvScanStatus.mockResolvedValue({
      status: 'MALICIOUS_FILE',
      time: '2024-12-23 17:00:23Z'
    })

    await handleFileUpload(data, 'application/pdf', metadata)

    expect(addDmzObject).toHaveBeenCalledWith(data, 'application/pdf', metadata)
    expect(addMalObject).toHaveBeenCalledWith(data, 'application/pdf', metadata, id)
  })

  test('should throw an error if moving the file to quarantine fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')

    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = '0230964f-ee67-4c70-920e-84847200140d/af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    getAvScanStatus.mockResolvedValue({
      status: 'MALICIOUS_FILE',
      time: '2024-12-23 17:00:23Z'
    })

    addDmzObject.mockResolvedValue(id)

    const mockError = new Error('Failed to move file to quarantine')

    addMalObject.mockRejectedValue(mockError)

    await expect(handleFileUpload(data, 'application/pdf', metadata)).rejects.toThrow(mockError.message)
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while moving to quarantine:', mockError)
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

    addDmzObject.mockResolvedValue(id)
    getAvScanStatus.mockRejectedValue(mockError)

    await handleFileUpload(data, 'application/pdf', metadata)

    expect(addDmzObject).toHaveBeenCalledWith(data, 'application/pdf', metadata)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`An error occurred while polling AV scan status for ${id}:`, mockError)
  })
})
