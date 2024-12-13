import checkFileExtension from '../utils/file-checks/extension-check.js'
import uploadFileToBlob from './upload-file-to-blob.js'

export const handleFileUpload = async (file, payload) => {
  checkFileExtension(file.hapi.filename)
  return uploadFileToBlob(file, payload)
}

export default handleFileUpload
