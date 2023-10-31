import { getOrCreateJourneyId, getStoredJourneyId, JOURNEY_ID_KEY } from '../src/journey';
import { ConfigStore } from '../src/config';
import { LAST_EVENT_ID_KEY } from '../src/events';

describe('JourneyId Management', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getOrCreateJourneyId', () => {

    it('should create a new journey ID if no last processed event exists', () => {
      jest.spyOn(ConfigStore, 'getJourneyTimeout').mockReturnValue(5000);
      const dummyEvent = { event_id: "01FJ2Z7C16TXME29E8M0QJ173P" };
      const journeyId = getOrCreateJourneyId(dummyEvent as any);
      
      expect(journeyId).toBeTruthy();
      expect(localStorage.getItem(JOURNEY_ID_KEY)).toBe(journeyId);
    });

    it('should reuse the current journey ID within the timeout', () => {
      jest.spyOn(ConfigStore, 'getJourneyTimeout').mockReturnValue(5000);
      
      // set a starting last processed event
      localStorage.setItem(LAST_EVENT_ID_KEY, "01FJ2Z7C16TXME29E8M0QJ173N");

      const dummyEvent1 = { event_id: "01FJ2Z7C16TXME29E8M0QJ173P" };
      const journeyId1 = getOrCreateJourneyId(dummyEvent1 as any);
      
      const dummyEvent2 = { event_id: "01FJ2Z7C19TYME29E8M0QJ173R" };
      const journeyId2 = getOrCreateJourneyId(dummyEvent2 as any);
      
      expect(journeyId1).toBe(journeyId2);
    });

    it('should create a new journey ID after the timeout', () => {
      jest.spyOn(ConfigStore, 'getJourneyTimeout').mockReturnValue(1000);
      
      // set a starting last processed event
      localStorage.setItem(LAST_EVENT_ID_KEY, "01FJ2Z7C16TXME29E8M0QJ173N");  

      const dummyEvent1 = { event_id: "01FJ2Z7C16TXME29E8M0QJ173P" };
      const journeyId1 = getOrCreateJourneyId(dummyEvent1 as any);
      
      const dummyEvent2 = { event_id: "01FJ2Z7F16TXME29E8M0QJ173S" };
      const journeyId2 = getOrCreateJourneyId(dummyEvent2 as any);
      
      expect(journeyId1).not.toBe(journeyId2);
    });

  });

  describe('getStoredJourneyId', () => {

    it('should retrieve stored journey ID if it exists', () => {
      const storedId = "01FJ2Z7C16TXME29E8M0QJ173P";
      localStorage.setItem("ROSNIK_JOURNEY_ID", storedId);
      const retrievedId = getStoredJourneyId();
      expect(retrievedId).toBe(storedId);
    });

    it('should create a new journey ID if none exists', () => {
      const retrievedId = getStoredJourneyId();
      expect(retrievedId).toBeTruthy();
      expect(localStorage.getItem(JOURNEY_ID_KEY)).toBe(retrievedId);
    });

  });

});
