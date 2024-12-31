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
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    await expect(maliciousRepo.quarantineObject(file, null, attributes)).rejects.toThrow('Path is required')
  })

  test('quarantine object should throw an error when path is invalid', async () => {
    const file = 'file'
    const path = 'invalid-path'
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    await expect(maliciousRepo.quarantineObject(file, path, attributes)).rejects.toThrow('Path must be in the format of folder/filename')
  })

  test('quarantine object should throw an error if upload fails', async () => {
    const file = 'file'
    const path = 'folder/filename'
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    const mockError = new Error('Storage error')

    mockBlobClient.uploadData.mockRejectedValue(mockError)

    await expect(maliciousRepo.quarantineObject(file, path, attributes)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while uploading blob:', mockError)
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
