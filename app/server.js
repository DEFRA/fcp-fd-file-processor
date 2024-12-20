import Hapi from '@hapi/hapi'
import HapiPino from 'hapi-pino'
import Joi from 'joi'

import router from './plugins/router.js'

const createServer = async () => {
  const server = Hapi.server({
    port: process.env.PORT
  })

  server.validator(Joi)

  await server.register({
    plugin: HapiPino,
    options: {
      logPayload: true,
      level: 'warn'
    }
  })

  await server.register(router)

  return server
}

export { createServer }
