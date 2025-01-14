import {
  MALICIOUS_FILE
} from '../constants/av-results.js'

import * as dmzRepo from '../repos/dmz.js'
import * as cleanRepo from '../repos/clean.js'
import * as maliciousRepo from '../repos/malicious.js'
import { publishCleanFileEvent, publishMaliciousFileEvent } from '../messages/outbound/publish.js'

const handleFileUpload = async (file, attributes) => {
  const id = await dmzRepo.addObject(file, attributes)

  try {
    await dmzRepo.getAvScanStatus(id)

    console.log(`AV scan passed. Moving ${id} to clean storage.`)

    await publishCleanFileEvent(id, attributes.metadata)
    await cleanRepo.addObject(file, id, attributes)
  } catch (err) {
    if (err.cause === MALICIOUS_FILE) {
      console.warn(`Uploaded file ${id} has been identified as malicious. Moving to quarantine.`)
      await publishMaliciousFileEvent(id, attributes.metadata)
      await maliciousRepo.quarantineObject(file, id, attributes)
    }

    return [null, err]
  } finally {
    console.log(`Deleting file ${id} from DMZ`)
    await dmzRepo.deleteObject(id)
  }

  return [id, null]
}

export {
  handleFileUpload
}
