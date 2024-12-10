import MAX_FILES from '../../constants/max-files.js'

const handleFileLimitExceeded = async (files) => {
  if (files.length > MAX_FILES) {
    throw new Error(`Uploaded files must be less than ${MAX_FILES} files.`)
  }
}

export default handleFileLimitExceeded
