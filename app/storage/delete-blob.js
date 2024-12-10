const deleteBlob = async (blockBlobClient) => {
  if (blockBlobClient) {
    await blockBlobClient.delete()
  }
}
export default deleteBlob
