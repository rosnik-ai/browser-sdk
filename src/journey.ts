import { monotonicFactory, decodeTime } from 'ulidx'

const ulid = monotonicFactory();
const JOURNEY_ID_KEY = "ROSNIK_JOURNEY_ID"
const LAST_EVENT_ID_KEY = "ROSNIK_LAST_EVENT_ID"
const TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

export function getOrCreateJourneyId(newEventId: string) {
    const newEventTimestamp = decodeTime(newEventId);
    const lastProcessedEventId = getLastProcessedEventId()
    // If we don't have a stored last processed event,
    // we need a new journey ID.
    if (!lastProcessedEventId) {
        const journeyId = createStoredJourneyId()
        storeLastProcessedEventId(newEventId)
        return journeyId
    }

    // If we have one, we want to either use our existing
    // journey ID or start a new one if we're passed the timeout.
    const lastProcessedEventTimestamp = decodeTime(lastProcessedEventId)
    let journeyId = getStoredJourneyId()
    // If the last event ID is outside of our window,
    // generate a new journey ID.
    if (newEventTimestamp - lastProcessedEventTimestamp > TIMEOUT) {
        journeyId = createStoredJourneyId()
    }

    // If we don't have a journey ID but we have a last processed event,
    // create a new one.
    if (!journeyId) {
        journeyId = createStoredJourneyId()
    }

    // Store the last known event ID, so we can compare on the next event.
    storeLastProcessedEventId(newEventId)

    return journeyId;
}

function createStoredJourneyId() {
    const journeyId = ulid()
    sessionStorage.setItem(JOURNEY_ID_KEY, journeyId);
    return journeyId;
}

export function getStoredJourneyId() {
    return sessionStorage.getItem(JOURNEY_ID_KEY)
}

function storeLastProcessedEventId(eventId: string) {
    sessionStorage.setItem(LAST_EVENT_ID_KEY, eventId)
}

function getLastProcessedEventId() {
    return sessionStorage.getItem(LAST_EVENT_ID_KEY)
}