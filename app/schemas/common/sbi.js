import Joi from 'joi'

const minSbi = 105000000
const maxSbi = 999999999

const sbi = Joi.number()
  .min(minSbi)
  .max(maxSbi)

export default sbi
