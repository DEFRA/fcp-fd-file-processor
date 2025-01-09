import healthy from '../routes/healthy.js'
import healthz from '../routes/healthz.js'
import objects from '../routes/objects.js'

const routes = [
  healthy,
  healthz,
  objects
]

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export default router
