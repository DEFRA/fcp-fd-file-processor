import { addObject } from '../repos/dmz.js'

const handleFileUpload = async (file, contentType, metadata) => {
  try {
    const id = await addObject(file, contentType, metadata)

    return id
  } catch (err) {
    console.error(err)

    throw err
  }
}

export {
  handleFileUpload
}
