import { v1 as uploadSchema } from '../schemas/upload/index.js'
import { handleFileUpload } from '../services/upload.js'
import { MAX_FILE_SIZE } from '../constants/file.js'

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

    const metadata = {
      filename: payload.file.hapi.filename,
      contentType: payload.file.hapi.headers['content-type'],
      ...request.payload
    }

    delete metadata.file

    const id = await handleFileUpload(data, metadata)

    return h.response({
      id,
      metadata
    }).code(201)
  }
}

export default upload
