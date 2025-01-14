import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { pdf } from '../../mocks/files'

jest.setTimeout(30000)

jest.unstable_mockModule('../../../app/repos/dmz', () => ({
  addObject: jest.fn(),
  deleteObject: jest.fn(),
  getAvScanStatus: jest.fn()
}))

jest.unstable_mockModule('../../../app/repos/clean', () => ({
  addObject: jest.fn(),
  deleteObject: jest.fn()
}))

jest.unstable_mockModule('../../../app/repos/malicious', () => ({
  quarantineObject: jest.fn()
}))

jest.unstable_mockModule('../../../app/messages/outbound/publish', () => ({
  publishCleanFileEvent: jest.fn(),
  publishMaliciousFileEvent: jest.fn()
}))

const dmzRepo = await import('../../../app/repos/dmz')
const cleanRepo = await import('../../../app/repos/clean')
const maliciousRepo = await import('../../../app/repos/malicious')

const { publishCleanFileEvent, publishMaliciousFileEvent } = await import('../../../app/messages/outbound/publish')

const { handleFileUpload } = await import('../../../app/services/upload')

describe('file upload service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should upload a file to the DMZ', async () => {
    dmzRepo.addObject.mockResolvedValue('af173eb1-e1dc-44dc-ab51-ff8a817371b2')

    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    dmzRepo.getAvScanStatus.mockResolvedValue('CLEAN_FILE')

    await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(dmzRepo.addObject).toHaveBeenCalledWith(data, { contentType: 'application/pdf', metadata })
  })

  test('should throw an error if the upload to DMZ fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const mockError = new Error('Failed to upload file')

    dmzRepo.addObject.mockRejectedValue(mockError)

    await expect(handleFileUpload(data, 'application/pdf', metadata)).rejects.toThrow('Failed to upload file')
  })

  test('should move a file to clean storage if it is identified as clean', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    dmzRepo.addObject.mockResolvedValue(id)

    dmzRepo.getAvScanStatus.mockResolvedValue('CLEAN_FILE')

    await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(cleanRepo.addObject).toHaveBeenCalledWith(data, id, { contentType: 'application/pdf', metadata })
  })

  test('should publish a clean file event if AV scan passes', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    dmzRepo.addObject.mockResolvedValue(id)

    dmzRepo.getAvScanStatus.mockResolvedValue('CLEAN_FILE')

    await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(publishCleanFileEvent).toHaveBeenCalledWith(id, metadata)
  })

  test('should return an error if moving the file to clean storage fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    dmzRepo.getAvScanStatus.mockResolvedValue('CLEAN_FILE')

    dmzRepo.addObject.mockResolvedValue(id)

    const mockError = new Error('Failed to move file to clean storage')

    cleanRepo.addObject.mockRejectedValue(mockError)

    const [, err] = await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(err).toEqual(mockError)
  })

  test('should move a file to quarantine if it is identified as malicious', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    dmzRepo.addObject.mockResolvedValue(id)

    const mockError = new Error('Uploaded file has been identified as malicious', { cause: 'MALICIOUS_FILE' })

    dmzRepo.getAvScanStatus.mockRejectedValue(mockError)

    await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(maliciousRepo.quarantineObject).toHaveBeenCalledWith(data, id, { contentType: 'application/pdf', metadata })
  })

  test('should publish a malicious file event if AV scan fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    dmzRepo.addObject.mockResolvedValue(id)

    const mockError = new Error('Uploaded file has been identified as malicious', { cause: 'MALICIOUS_FILE' })

    dmzRepo.getAvScanStatus.mockRejectedValue(mockError)

    await handleFileUpload(data, { contentType: 'application/pdf', metadata })

    expect(publishMaliciousFileEvent).toHaveBeenCalledWith(id, metadata)
  })

  test('should throw an error if moving the file to quarantine fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    const id = 'af173eb1-e1dc-44dc-ab51-ff8a817371b2'

    const mockMaliciousError = new Error('Uploaded file has been identified as malicious', { cause: 'MALICIOUS_FILE' })

    dmzRepo.getAvScanStatus.mockRejectedValue(mockMaliciousError)

    dmzRepo.addObject.mockResolvedValue(id)

    const mockError = new Error('Failed to move file to quarantine')

    maliciousRepo.quarantineObject.mockRejectedValue(mockError)

    await expect(handleFileUpload(data, { contentType: 'application/pdf', metadata })).rejects.toThrow('Failed to move file to quarantine')
  })
})
