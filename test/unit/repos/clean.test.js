import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

const mockBlobClient = {
  uploadData: jest.fn(),
  deleteIfExists: jest.fn(),
  getTags: jest.fn()
}

jest.unstable_mockModule('../../../app/storage/blob/clean.js', () => ({
  containers: {
    objects: {
      getBlockBlobClient: jest.fn(() => mockBlobClient)
    }
  }
}))

const cleanRepo = await import('../../../app/repos/clean.js')

const consoleErrorSpy = jest.spyOn(console, 'error')

describe('clean repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('add object should throw an error if upload fails', async () => {
    const file = 'file'
    const path = 'folder/filename'
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    const mockError = new Error('Storage error')

    mockBlobClient.uploadData.mockRejectedValue(mockError)

    await expect(cleanRepo.addObject(file, path, attributes)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while uploading blob:', mockError)
  })

  test('delete object should throw an error if delete fails', async () => {
    const path = 'path/path'

    const mockError = new Error('Storage error')

    mockBlobClient.deleteIfExists.mockRejectedValue(mockError)

    await expect(cleanRepo.deleteObject(path)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while deleting blob:', mockError)
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
