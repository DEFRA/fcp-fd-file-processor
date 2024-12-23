import { addObject } from '../repos/dmz.js'
import { v1 as uploadSchema } from '../schemas/upload/index.js'
import { handleFileUpload } from '../services/upload.js'

const upload = {
  method: 'POST',
  path: '/upload',
  options: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      multipart: true,
      maxBytes: 50 * 1024 * 1024
    },
    validate: {
      payload: uploadSchema,
      options: {
        abortEarly: false
      },
      failAction: async (_, h, err) => {
        const errors = err.details.map(({ message }) => message)

        let code = 400

        if (errors.every(e => e.includes('Unsupported content type'))) {
          code = 415
        }
  
        return h.response({ errors }).code(code).takeover()
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
