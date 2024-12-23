import { addObject } from '../repos/dmz.js'

const storeFile = async (file, metadata) => {
  try {
    const path = await addObject(file, metadata.contentType)

    return path
  } catch (err) {
    console.error(err)

    throw err
  }
}

export {
  storeFile
}