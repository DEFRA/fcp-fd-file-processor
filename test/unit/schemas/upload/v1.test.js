import { describe, test } from '@jest/globals'

import { pdf, png } from '../../../mocks/files'
import { v1 } from '../../../../app/schemas/upload'

describe('upload schema', () => {
  describe('file types', () => {
    test('should not return an error if the file type is supported and types match', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      const value = await v1.validateAsync(payload)

      expect(value).toEqual(payload)
    })

    test('should return an error if the file type is not supported', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.png',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'image/png'
            }
          },
          _data: png
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('Unsupported content type. Supported types are: [application/pdf]')
    })

    test('should return an error if the file is missing extension', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('File is missing extension and / or mime type')
    })

    test('should return an error if the file is missing mime type', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('"file.hapi.headers.content-type" is required')
    })

    test('should return an error if the file extension does not match the detected extension', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: png
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        console.log(err)
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('Detected extension (.png) does not match the provided extension (.pdf)')
    })

    test('should return an error if the mime type does not match the detected mime type', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.png',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: png
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('Detected type (image/png) does not match the provided type (application/pdf)')
    })

    test('should return an error if unable to detect file type', async () => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: Buffer.from('test')
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain('Unable to detect file type. Verify that the file is not corrupted')
    })
  })

  describe('required fields', () => {
    test.each([
      ['sbi'],
      ['sourceSystem'],
      ['documentType']
    ])('should return an error if %s is missing', async (field) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      delete payload[field]

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain(`"${field}" is required`)
    })
  })

  describe('crn', () => {
    test.each([
      1050000000,
      1092374890,
      9999999999
    ])('valid crn %s should not error', async (crn) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement',
        crn
      }

      const value = await v1.validateAsync(payload)

      expect(value).toEqual(payload)
    })

    test.each([
      ['1049999999', '"crn" must be greater than or equal to 1050000000'],
      ['10000000000', '"crn" must be less than or equal to 9999999999'],
      ['123456789a', '"crn" must be a number'],
      ['asdfghjkl', '"crn" must be a number']
    ])('invalid crn %s should error', async (crn, expectedMessage) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem: 'source',
        documentType: 'agreement',
        crn
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain(expectedMessage)
    })
  })

  describe('sbi', () => {
    test.each([
      105000000,
      109237489,
      999999999
    ])('valid sbi %s should not error', async (sbi) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      const value = await v1.validateAsync(payload)

      expect(value).toEqual(payload)
    })

    test.each([
      ['104999999', '"sbi" must be greater than or equal to 105000000'],
      ['1000000000', '"sbi" must be less than or equal to 999999999'],
      ['123456789a', '"sbi" must be a number'],
      ['asdfghjkl', '"sbi" must be a number']
    ])('invalid sbi %s should error', async (sbi, expectedMessage) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi,
        sourceSystem: 'source',
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain(expectedMessage)
    })
  })

  describe('sourceSystem', () => {
    test.each([
      'source',
      'source-system',
      'source_system',
      '123456789'
    ])('valid sourceSystem %s should not error', async (sourceSystem) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem,
        documentType: 'agreement'
      }

      const value = await v1.validateAsync(payload)

      expect(value).toEqual(payload)
    })

    test.each([
      ['source.system', '"sourceSystem" with value "source.system" fails to match the required pattern: /^[a-z0-9-_]+$/'],
      ['source$system', '"sourceSystem" with value "source$system" fails to match the required pattern: /^[a-z0-9-_]+$/'],
      ['sourceSystem', '"sourceSystem" with value "sourceSystem" fails to match the required pattern: /^[a-z0-9-_]+$/']
    ])('invalid sourceSystem %s should error', async (sourceSystem, expectedMessage) => {
      const payload = {
        file: {
          hapi: {
            filename: 'agreement.pdf',
            headers: {
              'content-disposition': 'content-disposition',
              'content-type': 'application/pdf'
            }
          },
          _data: pdf
        },
        sbi: 123456789,
        sourceSystem,
        documentType: 'agreement'
      }

      let error

      try {
        await v1.validateAsync(payload, { abortEarly: false })
      } catch (err) {
        error = err
      }

      expect(error.details).toBeDefined()

      const messages = error.details.map(detail => detail.message)

      expect(messages).toContain(expectedMessage)
    })
  })
})
