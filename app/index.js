import { setup } from './insights.js'
import 'log-timestamp'
import { createServer } from './server/server.js'
import blobStorage from './storage/blob-storage.js'

const { connectToBlob } = blobStorage

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)
  await connectToBlob()
  console.log('Connected to blob storage')
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

setup()
init()
