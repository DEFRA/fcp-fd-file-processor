import handleFileLimitExceeded from '../utils/file-checks/lenght-of-files-array-check.js'
import handleFileUpload from '../storage/handle-file-upload.js'

const fileUploadRoute = {
  method: 'POST',
  path: '/upload',
  options: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      multipart: true,
      maxBytes: 50 * 1024 * 1024
    }
  },
  handler: async (request, h) => {
    const { payload } = request
    const { files } = payload
    const filesArray = Array.isArray(files) ? files : [files]
    const results = []

    try {
      handleFileLimitExceeded(filesArray)

      for (const file of filesArray) {
        const result = await handleFileUpload(file, payload)
        results.push(result)
      }

      return h.response(results).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(400)
    }
  }
}

export default fileUploadRoute
