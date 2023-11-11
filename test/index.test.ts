import { JOURNEY_ID_KEY } from '../src/journey';
import { ConfigStore } from '../src/config';
import { Rosnik } from '../src/index';
import fetchIntercept from 'fetch-intercept';
import { decodeTime, ulid } from 'ulidx';
import { LAST_EVENT_ID_KEY } from '../src/events';

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

    it('should correctly set environment in ConfigStore when provided', () => {
      const mockConfig = {
        apiKey: 'testKey',
        allowedDomains: ['example.com'],
        environment: 'staging'
      };

      Rosnik.init(mockConfig);

      expect(ConfigStore.getEnvironment()).toBe('staging');
    });

    it('should default to a specific environment if not provided', () => {
      const mockConfig = {
        apiKey: 'testKey',
        allowedDomains: ['example.com']
      };

      Rosnik.init(mockConfig);

      // Adjust this to whatever your default is
      expect(ConfigStore.getEnvironment()).toBeNull();
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

  describe('startJourney', () => {
    const originalLocalStorage = global.localStorage;
    let now: number;

    beforeEach(() => {
      ConfigStore.setConfig({
        apiKey: ''
      })
      // Mock time
      now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });

    afterEach(() => {
      // Restore real timers
      jest.useRealTimers();
      // Clear localStorage
      localStorage.clear();
      ConfigStore.resetConfig();
    });

    afterAll(() => {
      // Restore the original localStorage
      global.localStorage = originalLocalStorage;
    });

    test('should create a new journey if no last event and journey is expired', () => {
      const journeyTimeout = ConfigStore.getJourneyTimeout();
      const expiredTime = now - journeyTimeout - 1;
      localStorage.setItem(JOURNEY_ID_KEY, ulid(expiredTime));

      Rosnik.init({
        apiKey: ''
      })

      const newJourneyId = localStorage.getItem(JOURNEY_ID_KEY);
      expect(newJourneyId).not.toBeNull();
      expect(decodeTime(newJourneyId as string)).toBeGreaterThan(expiredTime);
    });

    test('should do nothing if last event and journey are within timeout', () => {
      // Set up a scenario where both are within timeout
      const withinTimeout = now - 5000; // 5 seconds ago
      const journeyId = ulid(withinTimeout)
      const lastEventId = ulid(withinTimeout)
      localStorage.setItem(JOURNEY_ID_KEY, journeyId);
      localStorage.setItem(LAST_EVENT_ID_KEY, lastEventId);

      Rosnik.init({
        apiKey: ''
      })

      // Expect no changes
      expect(localStorage.getItem(JOURNEY_ID_KEY)).toBe(journeyId);
      expect(localStorage.getItem(LAST_EVENT_ID_KEY)).toBe(lastEventId);
    });

    test('should create a new journey and reset event storage if both are expired', () => {
      const journeyTimeout = ConfigStore.getJourneyTimeout();
      const expiredTime = now - journeyTimeout - 1;
      const journeyId = ulid(expiredTime)
      const lastEventId = ulid(expiredTime)
      localStorage.setItem(JOURNEY_ID_KEY, journeyId);
      localStorage.setItem(LAST_EVENT_ID_KEY, lastEventId);

      Rosnik.init({
        apiKey: ''
      })

      const newJourneyId = localStorage.getItem(JOURNEY_ID_KEY);
      expect(newJourneyId).not.toBeNull();
      expect(decodeTime(newJourneyId as string)).toBeGreaterThan(expiredTime);
      expect(localStorage.getItem(LAST_EVENT_ID_KEY)).toBeNull();
    });

    test('should reset last event storage if last event is expired but journey is within timeout', () => {
      const journeyTimeout = ConfigStore.getJourneyTimeout();
      const expiredTime = now - journeyTimeout - 1;
      const withinTimeout = now - 5000; // 5 seconds ago
      const journeyId = ulid(withinTimeout)
      const lastEventId = ulid(expiredTime)
      localStorage.setItem(JOURNEY_ID_KEY, journeyId);
      localStorage.setItem(LAST_EVENT_ID_KEY, lastEventId);

      Rosnik.init({
        apiKey: ''
      })

      expect(localStorage.getItem(LAST_EVENT_ID_KEY)).toBeNull();
      expect(localStorage.getItem(JOURNEY_ID_KEY)).toBe(journeyId);
    });
  })
});
