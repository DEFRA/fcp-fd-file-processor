const route = {
  method: 'GET',
  path: '/healthz',
  handler: (request, h) => {
    return h.response('ok').code(200)
  }
}

export default route
