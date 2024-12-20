import environments from '../constants/environments.js'

const isProd = () => {
  return process.env.NODE_ENV === environments.PRODUCTION
}

export default isProd
