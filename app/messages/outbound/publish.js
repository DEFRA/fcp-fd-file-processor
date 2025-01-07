import { MessageSender } from 'ffc-messaging'
import { messageConfig } from '../../config/index.js'
import { v4 as uuidv4 } from 'uuid'

const config = {
  ...messageConfig.get('messageQueue'),
  ...messageConfig.get('dataLayerTopic')
}

const buildFileEventMessage = (id, metadata, avStatus) => {
  return {
    specversion: '1.0.2',
    id: uuidv4(),
    source: 'fcp-fd-file-processor',
    type: `uk.gov.fcp.sfd.file.${avStatus}.v1`,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      id,
      ...metadata
    }
  }
}

const publishFileEventMetadata = async (id, metadata, avStatus) => {
  const sender = new MessageSender(config)
  const cloudEvent = buildFileEventMessage(id, metadata, avStatus)

  const serviceBusMessage = {
    body: cloudEvent,
    type: 'application/json',
    source: 'fcp-fd-file-processor'
  }

  try {
    await sender.sendMessage(serviceBusMessage)
    console.log(`File event of type "${cloudEvent.type}" published successfully`)
  } catch (error) {
    console.error(`Failed to publish file event of type "${cloudEvent.type}"`, error)
  }
}

export {
  publishFileEventMetadata
}
