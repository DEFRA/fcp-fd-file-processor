import Joi from 'joi'

const minCrn = 1050000000
const maxCrn = 9999999999

const crn = Joi.number()
  .min(minCrn)
  .max(maxCrn)

export default crn
