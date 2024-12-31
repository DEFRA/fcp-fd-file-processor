import {
  MALICIOUS_FILE
} from '../constants/av-results.js'

import * as dmzRepo from '../repos/dmz.js'
import * as cleanRepo from '../repos/clean.js'
import * as maliciousRepo from '../repos/malicious.js'

const handleFileUpload = async (file, contentType, metadata) => {
  const attributes = {
    contentType,
    metadata
  }

  const path = await dmzRepo.addObject(file, attributes)

  try {
    await dmzRepo.getAvScanStatus(path)

    console.log(`AV scan passed. Moving ${path} to clean storage.`)

    await cleanRepo.addObject(file, path, attributes)
  } catch (err) {
    if (err.cause === MALICIOUS_FILE) {
      console.warn(`Uploaded file ${path} has been identified as malicious. Moving to quarantine.`)
      await maliciousRepo.quarantineObject(file, path, attributes)

      return [null, err]
    }

    throw err
  } finally {
    console.log(`Deleting file ${path} from DMZ`)
    await dmzRepo.deleteObject(path)
  }

  return [path, null]
}

export {
  handleFileUpload
}
