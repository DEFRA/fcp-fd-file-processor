import { MessageSender } from 'ffc-messaging'
import { messageConfig } from '../../config/index.js'
import { v4 as uuidv4 } from 'uuid'

const config = {
  ...messageConfig.get('messageQueue'),
  ...messageConfig.get('dataLayerTopic')
}

const buildCloudEvent = (metadata, type) => {
  return {
    specversion: '1.0.0',
    id: uuidv4(),
    source: 'fcp-fd-file-processor',
    type,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: metadata
  }
}

const publishMetadataEvent = async (metadata, type) => {
  const sender = new MessageSender(config)
  const cloudEvent = buildCloudEvent(metadata, type)

  const serviceBusMessage = {
    body: cloudEvent,
    type: 'application/json',
    source: 'fcp-fd-file-processor'
  }

  try {
    await sender.sendMessage(serviceBusMessage)
    console.log('Metadata published successfully')
  } catch (error) {
    console.error('Failed to publish metadata', error)
  }
}

const publishCleanFileEvent = async (metadata) => {
  await publishMetadataEvent(metadata, 'uk.gov.fcp.sfd.file.clean')
}

const publishMaliciousFileEvent = async (metadata) => {
  await publishMetadataEvent(metadata, 'uk.gov.fcp.sfd.file.malicious')
}

export { publishCleanFileEvent, publishMaliciousFileEvent }
