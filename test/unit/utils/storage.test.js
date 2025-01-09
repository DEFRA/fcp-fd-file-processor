import { jest } from '@jest/globals'

// Mock dependencies
const mockDefaultAzureCredential = jest.fn()
const mockGetBearerTokenProvider = jest.fn()
jest.unstable_mockModule('@azure/identity', () => ({
  DefaultAzureCredential: mockDefaultAzureCredential,
  getBearerTokenProvider: mockGetBearerTokenProvider
}))

// Mock the `isProd` function to return `true`
jest.unstable_mockModule('../../../app/utils/is-prod.js', () => ({
  default: jest.fn(() => true)
}))

// Mock the storage object
const mockStorage = { hooks: {} }
jest.unstable_mockModule('../../../app/config/index.js', () => ({
  storage: mockStorage
}))

describe('storage.hooks.beforeConnect', () => {
  let beforeConnect

  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()

    // Import the file after mocking modules
    await import('../../../app/utils/storage.js')
    beforeConnect = mockStorage.hooks.beforeConnect
  })

  test('should set `cfg.password` using `getBearerTokenProvider`', async () => {
    const mockCfg = {}

    // Mock the behavior of DefaultAzureCredential and getBearerTokenProvider
    const mockCredential = {}
    mockDefaultAzureCredential.mockReturnValue(mockCredential)

    const mockTokenProvider = jest.fn()
    mockGetBearerTokenProvider.mockReturnValue(mockTokenProvider)

    // Call the beforeConnect hook
    await beforeConnect(mockCfg)

    // Assertions
    expect(mockDefaultAzureCredential).toHaveBeenCalledWith({
      managedIdentityClientId: process.env.AZURE_CLIENT_ID
    })
    expect(mockGetBearerTokenProvider).toHaveBeenCalledWith(
      mockCredential,
      'https://ossrdbms-aad.database.windows.net/.default'
    )
    expect(mockCfg.password).toBe(mockTokenProvider)
  })
})
