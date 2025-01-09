const uploadBlob = async (client, file, path, attributes) => {
  try {
    const blob = client.getBlockBlobClient(path)

    await blob.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: attributes.contentType
      }
    })
  } catch (err) {
    console.error('An error occurred while uploading blob:', err)

    throw err
  }
}

const getBlobTags = async (client, path) => {
  const blob = client.getBlockBlobClient(path)

  try {
    const { tags } = await blob.getTags()

    return tags
  } catch (err) {
    console.error('An error occurred while getting tags:', err)

    throw err
  }
}

const deleteBlob = async (client, path) => {
  try {
    const blob = client.getBlockBlobClient(path)

    await blob.deleteIfExists()
  } catch (err) {
    console.error('An error occurred while deleting blob:', err)

    throw err
  }
}

export {
  uploadBlob,
  getBlobTags,
  deleteBlob
}
