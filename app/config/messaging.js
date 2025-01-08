import convict from 'convict'
import environments from '../constants/environments.js'

const messaging = convict({
  messageQueue: {
    host: {
      doc: 'Message queue host.',
      format: String,
      default: null,
      env: 'MESSAGE_QUEUE_HOST'
    },
    username: {
      doc: 'Message queue username.',
      format: String,
      default: null,
      nullable: true,
      env: 'MESSAGE_QUEUE_USER'
    },
    password: {
      doc: 'Message queue password.',
      format: String,
      default: null,
      nullable: true,
      env: 'MESSAGE_QUEUE_PASSWORD'
    },
    connectionString: {
      doc: 'Azure Service Bus connection string (intended for use with service bus emulator).',
      format: String,
      default: null,
      nullable: true,
      env: 'MESSAGE_QUEUE_CONNECTION_STRING'
    },
    useCredentialChain: {
      doc: 'Use of credential chain for authentication.',
      format: Boolean,
      default: process.env.NODE_ENV === environments.PRODUCTION
    },
    managedIdentityClientId: {
      doc: 'Client ID of the managed identity for the service.',
      format: String,
      default: null,
      nullable: true,
      env: 'AZURE_CLIENT_ID'
    },
    appInsights: {
      doc: 'App Insights client instance.',
      format: '*',
      default: process.env.NODE_ENV === environments.PRODUCTION ? await import('applicationinsights') : undefined
    }
  },
  dataLayerTopic: {
    address: {
      doc: 'Data topic address (i.e. name of topic for data messages).',
      format: String,
      default: null,
      env: 'DATA_TOPIC_ADDRESS'
    },
    type: {
      doc: 'Type of topic (value is "topic" by default as it is a data topic).',
      format: String,
      default: 'topic'
    }
  }
})

messaging.validate({ allowed: 'strict' })

export default messaging
