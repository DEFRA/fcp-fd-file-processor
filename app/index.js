import { setup } from './insights.js'
import 'log-timestamp'

import { createServer } from './server.js'

import { createDmzContainers } from './storage/blob/dmz.js'
import { createMalContainers } from './storage/blob/malicious.js'
import { createCleanContainers } from './storage/blob/clean.js'

const init = async () => {
  if (process.env.NODE_ENV === 'development') {
    await createDmzContainers()
    await createCleanContainers()
    await createMalContainers()
  }

  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

setup()
init()
