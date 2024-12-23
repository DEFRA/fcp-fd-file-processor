import Joi from 'joi'
import { fileTypeFromBuffer } from 'file-type'

import { sbi, crn } from '../common/index.js'
import { getExtension } from '../../utils/files.js'

const validFileTypes = [
  'application/pdf'
]

const checkFileType = async (value, helpers) => {
  const { filename, headers } = value.hapi

  const extension = getExtension(filename)
  const mimeType = headers['content-type']

  if (!extension || !mimeType) {
    return helpers.message('File is missing extension and / or mime type')
  }

  const detected = await fileTypeFromBuffer(value._data)

  if (extension !== detected.ext) {
    return helpers.message(`Detected extension (.${detected.ext}) does not match the provided extension (.${extension})`)
  }

  if (mimeType !== detected.mime) {
    return helpers.message(`Detected type (${detected.mime}) does not match the provided type (${mimeType})`)
  }

  return value
}

const v1 = Joi.object({
  file: Joi.object({
    hapi: Joi.object({
      filename: Joi.string().required(),
      headers: Joi.object({
        'content-disposition': Joi.string().required(),
        'content-type': Joi.string().valid(...validFileTypes).required().messages({
          'any.only': '.message(`Unsupported content type. Supported types are: {{#valids}}`)'
        })
      }).required()
    }).unknown().required(),
    _data: Joi.binary().required()
  }).unknown().external(checkFileType).required(),
  sbi: sbi.required(),
  crn: crn.optional(),
  sourceSystem: Joi.string().regex(/^[a-z0-9-_]+$/).required(),
  documentType: Joi.string().regex(/^[a-z0-9-_]+$/).required()
}).required()

export default v1
