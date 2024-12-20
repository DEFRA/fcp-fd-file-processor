import healthy from '../routes/healthy.js'
import healthz from '../routes/healthz.js'

const routes = [
  healthy,
  healthz
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
