import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

const mockBlobClient = {
  uploadData: jest.fn(),
  deleteIfExists: jest.fn(),
  getTags: jest.fn()
}

jest.unstable_mockModule('../../../app/storage/blob/malicious.js', () => ({
  containers: {
    objects: {
      getBlockBlobClient: jest.fn(() => mockBlobClient)
    }
  }
}))

const maliciousRepo = await import('../../../app/repos/malicious.js')

const consoleErrorSpy = jest.spyOn(console, 'error')

describe('malicious repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('quarantine object should throw an error when path is not provided', async () => {
    const file = 'file'
    const contentType = 'content-type'
    const metadata = { metadata: 'metadata' }

    await expect(maliciousRepo.quarantineObject(file, contentType, metadata)).rejects.toThrow('Path is required.')
  })

  test('quarantine object should throw an error when path is invalid', async () => {
    const file = 'file'
    const contentType = 'content-type'
    const metadata = { metadata: 'metadata' }
    const path = 'invalid-path'

    await expect(maliciousRepo.quarantineObject(file, contentType, metadata, path)).rejects.toThrow('Path must be in the format of folder/filename')
  })

  test('quarantine object should throw an error if upload fails', async () => {
    const file = 'file'
    const contentType = 'content-type'
    const metadata = { metadata: 'metadata' }
    const path = 'folder/filename'

    const mockError = new Error('Storage error')

    mockBlobClient.uploadData.mockRejectedValue(mockError)

    await expect(maliciousRepo.quarantineObject(file, contentType, metadata, path)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while adding to quarantine:', mockError)
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
