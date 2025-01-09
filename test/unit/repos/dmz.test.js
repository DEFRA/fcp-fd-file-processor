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
    const attributes = {
      contentType: 'content-type',
      metadata: { metadata: 'metadata' }
    }

    const mockError = new Error('Storage error')

    mockBlobClient.uploadData.mockRejectedValue(mockError)

    await expect(dmzRepo.addObject(file, attributes)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while uploading blob:', mockError)
  })

  test('delete object should throw an error if upload fails', async () => {
    const path = 'path/path'

    const mockError = new Error('Storage error')

    mockBlobClient.deleteIfExists.mockRejectedValue(mockError)

    await expect(dmzRepo.deleteObject(path)).rejects.toThrow('Storage error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while deleting blob:', mockError)
  })

  test('clean file should return clean status', async () => {
    const path = 'path/path'

    mockBlobClient.getTags.mockResolvedValue({
      tags: {
        'Malware Scanning scan result': 'No threats found'
      }
    })

    const status = await dmzRepo.getAvScanStatus(path)

    expect(status).toBe('CLEAN_FILE')
  })

  test('malicious file should throw an error', async () => {
    const path = 'path/path'

    mockBlobClient.getTags.mockResolvedValue({
      tags: {
        'Malware Scanning scan result': 'Malicious'
      }
    })

    try {
      await dmzRepo.getAvScanStatus(path)
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('Uploaded file has been identified as malicious')
      expect(err.cause).toBe('MALICIOUS_FILE')
    }
  })

  test('unknown status should throw an error', async () => {
    const path = 'path/path'

    mockBlobClient.getTags.mockResolvedValue({
      tags: {
        'Malware Scanning scan result': 'SAM123456'
      }
    })

    try {
      await dmzRepo.getAvScanStatus(path)
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('An error occurred while scanning the uploaded file')
      expect(err.cause).toBe('SAM123456')
    }
  })

  test('get av scan status should timeout if get tags fails', async () => {
    const mockError = new Error('Storage error')

    mockBlobClient.getTags.mockRejectedValue(mockError)

    try {
      await dmzRepo.getAvScanStatus('path/path')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('AV scan for path/path timed out after 10 attempts')
      expect(err.cause).toBe('AV_SCAN_TIMEOUT')
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while polling AV scan status for path/path:', mockError)
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })
})
