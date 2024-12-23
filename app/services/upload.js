import { addObject } from '../repos/dmz.js'

const handleUpload = async (file, metadata) => {
  try {
    const path = await addObject(file, metadata.contentType)

    return path
  } catch (err) {
    console.error(err)

    throw err
  }
}

export {
  handleUpload
}
