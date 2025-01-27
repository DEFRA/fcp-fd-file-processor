import {
  MALICIOUS_FILE
} from '../constants/av-results.js'

import * as dmzRepo from '../repos/dmz.js'
import * as cleanRepo from '../repos/clean.js'
import * as maliciousRepo from '../repos/malicious.js'
import { publishCleanFileEvent, publishMaliciousFileEvent } from '../messages/outbound/publish.js'

const handleFileUpload = async (file, attributes) => {
  const objectId = await dmzRepo.addObject(file, attributes)

  try {
    await dmzRepo.getAvScanStatus(objectId)

    console.log(`AV scan passed. Moving ${objectId} to clean storage.`)

    await publishCleanFileEvent(objectId, attributes.metadata)
    await cleanRepo.addObject(file, objectId, attributes)
  } catch (err) {
    if (err.cause === MALICIOUS_FILE) {
      console.warn(`Uploaded file ${objectId} has been identified as malicious. Moving to quarantine.`)
      await publishMaliciousFileEvent(objectId, attributes.metadata)
      await maliciousRepo.quarantineObject(file, objectId, attributes)
    }

    return [null, err]
  } finally {
    console.log(`Deleting file ${objectId} from DMZ`)
    await dmzRepo.deleteObject(objectId)
  }

  return [objectId, null]
}

export {
  handleFileUpload
}
