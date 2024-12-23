import { addObject } from '../repos/dmz.js'
import { v1 as uploadSchema } from '../schemas/upload/index.js'
import { storeFile } from '../services/upload.js'

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
      contentType: payload.file.hapi.headers['content-type'],
      ...request.payload
    }

    delete metadata.file

    const path = await storeFile(data, metadata)

    return h.response({ 
      path,
      metadata
    }).code(201)
  }
}

export default upload
