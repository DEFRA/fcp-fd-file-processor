import { describe, expect, jest, test } from '@jest/globals'
const mockSendMessage = jest.fn()

// Mock the MessageSender class and its sendMessage method
jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => ({
      sendMessage: mockSendMessage
    }))
  }
})

jest.mock('../../../app/config/index.js', () => {
  return {
    messageConfig: {
      get: jest.fn()
    }
  }
})

const { publishCleanFileEvent, publishMaliciousFileEvent } = await import('../../../app/messages/outbound/publish.js')
// const { MessageSender } = await import('ffc-messaging')
describe('publishMetadata', () => {
  const metadata = { key: 'value' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should handle errors when publishing metadata', async () => {
    const error = new Error('Failed to send message')
    mockSendMessage.mockRejectedValue(error)
    const consoleErrorSpy = jest.spyOn(console, 'error')

    await publishCleanFileEvent(metadata)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to publish metadata', error)

    consoleErrorSpy.mockRestore()
  })
  test('should publish clean file event successfully', async () => {
    mockSendMessage.mockResolvedValue()
    const consoleLogSpy = jest.spyOn(console, 'log')

    await publishCleanFileEvent(metadata)

    expect(mockSendMessage).toHaveBeenCalledWith({
      body: expect.objectContaining({
        specversion: '1.0.0',
        id: expect.any(String),
        source: 'fcp-fd-file-processor',
        type: 'uk.gov.fcp.sfd.file.clean',
        time: expect.any(String),
        datacontenttype: 'application/json',
        data: metadata
      }),
      type: 'application/json',
      source: 'fcp-fd-file-processor'
    })
    expect(consoleLogSpy).toHaveBeenCalledWith('Metadata published successfully')

    consoleLogSpy.mockRestore()
  })

  test('should publish malicious file event successfully', async () => {
    mockSendMessage.mockResolvedValue()
    const consoleLogSpy = jest.spyOn(console, 'log')

    await publishMaliciousFileEvent(metadata)

    expect(mockSendMessage).toHaveBeenCalledWith({
      body: expect.objectContaining({
        specversion: '1.0.0',
        id: expect.any(String),
        source: 'fcp-fd-file-processor',
        type: 'uk.gov.fcp.sfd.file.malicious',
        time: expect.any(String),
        datacontenttype: 'application/json',
        data: metadata
      }),
      type: 'application/json',
      source: 'fcp-fd-file-processor'
    })
    expect(consoleLogSpy).toHaveBeenCalledWith('Metadata published successfully')

    consoleLogSpy.mockRestore()
  })
})
