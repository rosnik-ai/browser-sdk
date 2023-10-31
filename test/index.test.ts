import { ConfigStore } from '../src/config';
import { Rosnik } from '../src/index';
import fetchIntercept from 'fetch-intercept';

jest.mock('fetch-intercept');

describe('Rosnik', () => {

  describe('init', () => {

    beforeEach(() => {
      // Clean up state and mocks
      ConfigStore.resetConfig();
      // Clear all cookies before each test
      document.cookie = '';  
      (fetchIntercept.register as jest.Mock).mockClear();
    });

    it('should set device ID cookie if not already present', () => {
      const config = { apiKey: 'testKey', allowedDomains: ['example.com'] };

      Rosnik.init(config);

      expect(document.cookie).toContain('rosnik-device-id=');
    });

    it('should not overwrite existing device ID cookie', () => {
      const existingDeviceId = 'existingId';
      document.cookie = `rosnik-device-id=${existingDeviceId}`;

      const config = { apiKey: 'testKey', allowedDomains: ['example.com'] };

      Rosnik.init(config);

      expect(document.cookie).toContain(`rosnik-device-id=${existingDeviceId}`);
    });

    it('should register fetch interceptor when allowedDomains is provided', () => {
      const registerSpy = jest.spyOn(fetchIntercept, 'register');
      const mockConfig = {
        apiKey: 'testKey',
        allowedDomains: ['example.com']
      };

      Rosnik.init(mockConfig);

      expect(registerSpy).toHaveBeenCalled();
    });

    it('should not register fetch interceptor when allowedDomains is not provided', () => {
      const registerSpy = jest.spyOn(fetchIntercept, 'register');
      const mockConfig = {
        apiKey: 'testKey'
      };

      Rosnik.init(mockConfig);

      expect(registerSpy).not.toHaveBeenCalled();
    });
  });

  describe('track', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response));
      ConfigStore.resetConfig();
      // Clear all cookies before each test
      document.cookie = ''; 
    });

    it('should send event data to the API', async () => {
      const dummyEvent = {
        store: jest.fn(),
        someProperty: 'dummyData'
      };

      const config = { apiKey: 'testKey', allowedDomains: ['example.com'] };
      Rosnik.init(config)
      Rosnik.track(dummyEvent as any);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://ingest.rosnik.ai/api/v1/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer testKey'
          }),
          body: JSON.stringify(dummyEvent)
        })
      );

      expect(dummyEvent.store).toHaveBeenCalled();
    });

  });
});
