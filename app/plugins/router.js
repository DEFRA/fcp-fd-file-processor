import healthy from '../routes/healthy.js'
import healthz from '../routes/healthz.js'
import upload from '../routes/upload.js'

const routes = [
  healthy,
  healthz,
  upload
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
