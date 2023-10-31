import { ConfigStore } from './config';
import { RosnikEvent, getLastProcessedEventId } from './events';
import { monotonicFactory, decodeTime } from 'ulidx';

const ulid = monotonicFactory();
export const JOURNEY_ID_KEY = "ROSNIK_JOURNEY_ID"

export function getOrCreateJourneyId(newEvent: RosnikEvent) {
    const newEventTimestamp = decodeTime(newEvent.event_id);
    const lastProcessedEventId = getLastProcessedEventId()
    // If we don't have a stored last processed event,
    // we need a new journey ID.
    if (!lastProcessedEventId) {
        const journeyId = createStoredJourneyId()
        return journeyId
    }

    // If we have one, we want to either use our existing
    // journey ID or start a new one if we're passed the timeout.
    const lastProcessedEventTimestamp = decodeTime(lastProcessedEventId)
    let journeyId = getStoredJourneyId()
    // If the last event ID is outside of our window,
    // generate a new journey ID.
    if (newEventTimestamp - lastProcessedEventTimestamp > ConfigStore.getJourneyTimeout()) {
        journeyId = createStoredJourneyId()
    }

    // If we don't have a journey ID but we have a last processed event,
    // create a new one.
    if (!journeyId) {
        journeyId = createStoredJourneyId()
    }

    return journeyId;
}

function createStoredJourneyId() {
    const journeyId = ulid()
    localStorage.setItem(JOURNEY_ID_KEY, journeyId);
    return journeyId;
}

export function getStoredJourneyId() {
    const storedId = localStorage.getItem(JOURNEY_ID_KEY)
    if (!storedId) return createStoredJourneyId()
    return storedId
}
