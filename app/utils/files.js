const getExtension = (filename) => {
  const index = filename.lastIndexOf('.')

  if (index === -1) {
    return null
  }

  return filename.slice(index + 1)
}

export {
  getExtension
}
