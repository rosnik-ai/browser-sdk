import { SDK, Configuration } from '../src/index';

describe('SDK', () => {
  let sdk: SDK;
  let config: Configuration;
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    sdk = new SDK();
    config = {
      apiKey: 'test-api-key',
      sessionTimeout: 30,
      allowedDomains: ['https://api.example.com'],
    };
    sdk.init(config);
    mockFetch.mockReset();
  });

  describe('init', () => {
    it('shuold equal true', () => {
        expect(true).toBe(true)
    })
  });

  describe('aiGenerationStart', () => {
    // Write aiGenerationStart method tests here.
  });

  describe('aiGenerationFinish', () => {
    // Write aiGenerationFinish method tests here.
  });

  describe('userGoalSuccess', () => {
    // Write userGoalSuccess method tests here.
  });

  describe('userJourneyStart', () => {
    // Write userJourneyStart method tests here.
  });

  describe('userInteractionTrack', () => {
    // Write userInteractionTrack method tests here.
  });
  
  describe('userFeedbackTrack', () => {
    // Write userFeedbackTrack method tests here.
  });

  describe('track', () => {
    // Write track method tests here.
    // Even though this is a private method, you can still test it by mocking the responses of the public methods that use it.
  });

  describe('patchFetch', () => {
    // Similar to the track method, write patchFetch method tests based on the responses of the public methods.
  });
});