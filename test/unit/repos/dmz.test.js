import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

const mockBlobClient = {
  uploadData: jest.fn(),
  deleteIfExists: jest.fn(),
  getTags: jest.fn()
}

jest.unstable_mockModule('../../../app/storage/blob/dmz.js', () => ({
  containers: {
    objects: {
      getBlockBlobClient: jest.fn(() => mockBlobClient)
    }
  }
}))

const dmzRepo = await import('../../../app/repos/dmz.js')

const consoleErrorSpy = jest.spyOn(console, 'error')

describe('dmz repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('add object should throw an error if upload fails', async () => {
    const file = 'file'
    const contentType = 'content-type'
    const metadata = { metadata: 'metadata' }

    const mockError = new Error('Storage error')

    mockBlobClient.uploadData.mockRejectedValue(mockError)

    await expect(dmzRepo.addObject(file, contentType, metadata)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while adding to DMZ:', mockError)
  })

  test('delete object should throw an error if upload fails', async () => {
    const path = 'path/path'

    const mockError = new Error('Storage error')

    mockBlobClient.deleteIfExists.mockRejectedValue(mockError)

    await expect(dmzRepo.deleteObject(path)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while deleting from DMZ:', mockError)
  })

  test('get av scan status should throw an error if get tags fails', async () => {
    const mockError = new Error('Storage error')

    mockBlobClient.getTags.mockRejectedValue(mockError)

    await expect(dmzRepo.getAvScanStatus('path/path')).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while getting tags:', mockError)
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
