import { describe, expect, jest, test } from '@jest/globals'
const mockSendMessage = jest.fn()

jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => ({
      sendMessage: mockSendMessage
    }))
  }
})

jest.mock('../../../app/config/index.js', () => {
  return {
    messaging: {
      get: jest.fn()
    }
  }
})

const { publishCleanFileEvent, publishMaliciousFileEvent } = await import('../../../app/messages/outbound/publish.js')
describe('publishMetadata', () => {
  const metadata = { key: 'value' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should handle errors when publishing metadata', async () => {
    const error = new Error('Failed to send message')
    mockSendMessage.mockRejectedValue(error)
    const consoleErrorSpy = jest.spyOn(console, 'error')

    await expect(publishCleanFileEvent('123456', metadata)).rejects.toThrow('Failed to send message')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to publish file event',
      error
    )

    consoleErrorSpy.mockRestore()
  })
  test('should publish clean file event successfully', async () => {
    mockSendMessage.mockResolvedValue()

    await publishCleanFileEvent('123456', metadata)

    expect(mockSendMessage).toHaveBeenCalledWith({
      body: {
        specversion: '1.0.2',
        id: expect.any(String),
        source: 'fcp-fd-file-processor',
        type: 'uk.gov.fcp.sfd.file.clean.v1',
        time: expect.any(String),
        datacontenttype: 'application/json',
        data: {
          id: '123456',
          key: 'value'
        }
      },
      type: 'CloudEvent',
      source: 'fcp-fd-file-processor'
    })
  })

  test('should publish malicious file event successfully', async () => {
    mockSendMessage.mockResolvedValue()

    await publishMaliciousFileEvent('123456', metadata)

    expect(mockSendMessage).toHaveBeenCalledWith({
      body: expect.objectContaining({
        specversion: '1.0.2',
        id: expect.any(String),
        source: 'fcp-fd-file-processor',
        type: 'uk.gov.fcp.sfd.file.malicious.v1',
        time: expect.any(String),
        datacontenttype: 'application/json',
        data: {
          id: '123456',
          key: 'value'
        }
      }),
      type: 'CloudEvent',
      source: 'fcp-fd-file-processor'
    })
  })
})
