import { v1 as uploadSchema } from '../schemas/upload/index.js'
import { handleFileUpload } from '../services/upload.js'
import { MAX_FILE_SIZE } from '../constants/file.js'
import { MALICIOUS_FILE } from '../constants/av-results.js'

const upload = {
  method: 'POST',
  path: '/upload',
  options: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      multipart: true,
      maxBytes: MAX_FILE_SIZE
    },
    validate: {
      payload: uploadSchema,
      options: {
        abortEarly: false
      },
      failAction: async (_, h, err) => {
        const errors = err.details.map(({ message }) => message)

        if (errors.length === 1 && errors[0].includes('Unsupported content type')) {
          return h.response({ errors }).code(415).takeover()
        }

        return h.response({ errors }).code(400).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const payload = request.payload

    const data = payload.file._data
    const contentType = payload.file.hapi.headers['content-type']

    const metadata = {
      filename: payload.file.hapi.filename,
      ...payload
    }

    delete metadata.file

    const [id, err] = await handleFileUpload(data, contentType, metadata)

    if (err) {
      if (err.cause === MALICIOUS_FILE) {
        return h.response({
          errors: ['Uploaded file has been identified as malicious']
        }).code(400)
      }

      console.error('An error occurred while processing the file:', err)

      throw err
    }

    return h.response({ id, contentType, metadata }).code(201)
  }
}

export default upload
