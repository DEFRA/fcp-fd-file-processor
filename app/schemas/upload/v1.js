import Joi from 'joi'

import { sbi, crn } from '../common/index.js'
import { fileTypeFromBuffer } from 'file-type'
import { getExtension } from '../../utils/files.js'

const validFileTypes = [
  'application/pdf',
  'text/plain'
]

const checkFileType = async (value, helpers) => {
  const { filename, headers } = value.hapi

  const extension = getExtension(filename)
  const mimeType = headers['content-type']

  if (!extension || !mimeType) {
    return helpers.message('File is missing extension and / or mime type')
  }

  const detected = await fileTypeFromBuffer(value._data)

  if (!detected) {
    return value
  }

  if (extension !== detected.ext) {
    return helpers.message('Detected file extension does not match the provided file name')
  }

  if (mimeType !== detected.mime) {
    return helpers.message('Detected mime type does not match the provided content type')
  }

  return value
}

const v1 = Joi.object({
  file: Joi.object({
    hapi: Joi.object({
      filename: Joi.string().required(),
      headers: Joi.object({
        'content-disposition': Joi.string().required(),
        'content-type': Joi.string().valid(...validFileTypes).required()
      }).required()
    }).unknown().required(),
    _data: Joi.binary().required()
  }).unknown().external(checkFileType).required(),
  sbi: sbi.required(),
  crn: crn.optional(),
  sourceSystem: Joi.string().regex(/^[a-z0-9-_]+$/).required(),
  documentType: Joi.string().regex(/^[a-z0-9-_]+$/).required()
})

export default v1
