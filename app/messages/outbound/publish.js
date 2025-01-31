import { MessageSender } from 'ffc-messaging'
import { messagingConfig } from '../../config/index.js'
import { buildCleanFileMessage, buildMaliciousFileMessage } from './message-builder.js'

const config = {
  ...messagingConfig.get('messageQueue'),
  ...messagingConfig.get('dataLayerTopic')
}

const publishFileEvent = async (message) => {
  const sender = new MessageSender(config)

  try {
    await sender.sendMessage(message)
  } catch (error) {
    console.error('Failed to publish file event', error)
    throw error
  }
}

const publishCleanFileEvent = async (objectId, metadata) => {
  const message = buildCleanFileMessage(objectId, metadata)

  await publishFileEvent(message)
}

const publishMaliciousFileEvent = async (objectId, metadata) => {
  const message = buildMaliciousFileMessage(objectId, metadata)

  await publishFileEvent(message)
}

export {
  publishCleanFileEvent,
  publishMaliciousFileEvent
}
