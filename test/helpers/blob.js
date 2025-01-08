const getBlob = async (containerClient, path) => {
  const blob = containerClient.getBlockBlobClient(path)

  if (!(await blob.exists())) {
    throw new Error('The specified blob does not exist.')
  }

  return {
    buffer: await blob.downloadToBuffer(),
    properties: await blob.getProperties()
  }
}

export {
  getBlob
}
