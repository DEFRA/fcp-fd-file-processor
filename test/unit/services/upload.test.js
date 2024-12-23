import { describe, jest, test } from '@jest/globals'

import { pdf } from '../../mocks/files'

jest.unstable_mockModule('../../../app/repos/dmz', () => ({
  addObject: jest.fn()
}))

const { addObject } = await import('../../../app/repos/dmz')
const { handleFileUpload } = await import('../../../app/services/upload')

describe('file upload service', () => {
  test('should upload a file to the DMZ', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      contentType: 'application/pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    await handleFileUpload(data, metadata)

    expect(addObject).toHaveBeenCalledWith(data, 'application/pdf')
  })

  test('should throw an error if the file upload fails', async () => {
    const data = pdf

    const metadata = {
      filename: 'test.pdf',
      contentType: 'application/pdf',
      sbi: 123456789,
      sourceSystem: 'test',
      documentType: 'agreement'
    }

    addObject.mockRejectedValue(new Error('Failed to upload file'))

    await expect(handleFileUpload(data, metadata)).rejects.toThrow('Failed to upload file')
  })
})
