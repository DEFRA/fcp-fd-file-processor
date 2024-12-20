import { setup } from './insights.js'
import 'log-timestamp'
import { createServer } from './server.js'

import { dmz } from './storage/blob/index.js'

const containers = dmz.listContainers()

for await (const container of containers) {
  console.log(container)
}

const init = async () => {
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
