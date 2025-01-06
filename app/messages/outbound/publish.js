import { MessageSender } from 'ffc-messaging'
import { messageConfig } from '../../config/index.js'

const config = {
  ...messageConfig.get('messageQueue'),
  ...messageConfig.get('dataLayerTopic')
}

const publishMetadata = async (metadata) => {
  const sender = new MessageSender(config)
  const message = {
    body: metadata,
    type: 'metadata',
    source: 'fcp-fd-file-processor'
  }

  try {
    await sender.sendMessage(message)
    console.log('Metadata published successfully')
  } catch (error) {
    console.error('Failed to publish metadata', error)
  }
}

export default publishMetadata
