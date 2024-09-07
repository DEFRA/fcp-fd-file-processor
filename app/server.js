import Hapi from '@hapi/hapi'
import HapiPino from 'hapi-pino'
import Joi from 'joi'
import healthy from './routes/healthy.js'
import healthz from './routes/healthz.js'

const createServer = () => {
  const server = Hapi.server({
    port: process.env.PORT
  })

  const routes = [].concat(
    healthy,
    healthz
  )

  server.validator(Joi)
  server.route(routes)
  server.register({
    plugin: HapiPino,
    options: {
      logPayload: true,
      level: 'warn'
    }
  })

  return server
}

export { createServer }
