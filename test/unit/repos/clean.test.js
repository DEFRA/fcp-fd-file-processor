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

  test('add object should throw an error when path is invalid', async () => {
    const file = 'file'
    const path = 'invalid-path'
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    await expect(cleanRepo.addObject(file, path, attributes)).rejects.toThrow('Path must be in the format of folder/filename')
  })

  test('add object should throw an error if path is not provided', async () => {
    const file = 'file'
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    await expect(cleanRepo.addObject(file, null, attributes)).rejects.toThrow('Path is required')
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

  test('delete object should throw an error if upload fails', async () => {
    const path = 'path/path'

    const mockError = new Error('Storage error')

    mockBlobClient.deleteIfExists.mockRejectedValue(mockError)

    await expect(cleanRepo.deleteObject(path)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while deleting blob:', mockError)
  })

  test('delete object should throw an error if path is not provided', async () => {
    await expect(cleanRepo.deleteObject()).rejects.toThrow('Path is required.')
  })

  test('delete object should throw an error if path is invalid', async () => {
    const path = 'invalid-path'

    await expect(cleanRepo.deleteObject(path)).rejects.toThrow('Path must be in the format of folder/filename')
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
