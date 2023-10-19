import { getOrCreateJourneyId } from './journey';
import { Metadata } from "./metadata";
import { monotonicFactory } from 'ulidx';

const ulid = monotonicFactory();
const LAST_EVENT_ID_KEY = "ROSNIK_LAST_EVENT_ID"
// Tracking the last ai-request user.interaction.track event,
// so we can send that along to backends.
const LAST_INTERACTION_ID_KEY = "ROSNIK_LAST_INTERACTION_REQUEST_ID"

export function getLastProcessedEventId() {
    return localStorage.getItem(LAST_EVENT_ID_KEY)
}

export function getLastAIRequestInteractionId() {
    return localStorage.getItem(LAST_INTERACTION_ID_KEY)
}

export class RosnikEvent {
    event_id: string;
    event_type: string;
    journey_id: string;
    sent_at: number;
    occurred_at: number | null;
    context: Record<string, any> | null;
    user_id: string | null;
    device_id: string;
    user_interaction_id?: string | null;
    _metadata: Metadata;

    constructor(
        options: {
            event_type: string,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            device_id: string,
            user_interaction_id?: string | null;
            _metadata: Metadata
        }
    ) {
        this.event_id = ulid();
        this.event_type = options.event_type;
        this.journey_id = getOrCreateJourneyId(this);
        this.sent_at = Math.floor(Date.now());
        this.occurred_at = options.occurred_at ? options.occurred_at : null;
        this.context = options.context ? options.context : null;
        this.user_id = options.user_id ? options.user_id : null;
        this.device_id = options.device_id;
        this.user_interaction_id = options.user_interaction_id;
        this._metadata = options._metadata;
    }

    store() {
        localStorage.setItem(LAST_EVENT_ID_KEY, this.event_id)
    }
}

export class UserEvent extends RosnikEvent {
    user_properties: Record<string, any> | null;

    constructor(
        options: {
            event_type: string,
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            device_id: string,
            user_interaction_id?: string | null;
            _metadata: Metadata
        }
    ) {
        super({ ...options });
        this.user_properties = options.user_properties ? options.user_properties : null;
    }
}

export enum InteractionType {
    AI_REQUEST = "ai-request"
}

export class UserInteractionTrackEvent extends UserEvent {
    event_type: string = "user.interaction.track";
    interaction_type: InteractionType;

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            device_id: string,
            _metadata: Metadata,
            interaction_type: InteractionType,
            user_interaction_id?: string | null;
        }
    ) {
        super({ ...options, event_type: "user.interaction.track" });
        this.interaction_type = options.interaction_type;
    }

    /**
     * Store the AI request by the user so we can send the interaction
     * ID along to the backend, and store it as latest event.
     */
    store() {
        console.log("Storing user interaction", this.interaction_type)
        if (this.interaction_type === InteractionType.AI_REQUEST) {
            console.log("Storing AI interaction")
            localStorage.setItem(LAST_INTERACTION_ID_KEY, this.event_id)
        }
        super.store()
    }
}

export class UserFeedbackTrackEvent extends UserEvent {
    event_type: string = "user.feedback.track";
    score: number | null;
    open_feedback: string | null;

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            device_id: string,
            _metadata: Metadata,
            score?: number,
            open_feedback?: string
            user_interaction_id?: string | null;
        }
    ) {
        super({ ...options, event_type: "user.interaction.track" });
        this.score = options.score ? options.score : null;
        this.open_feedback = options.open_feedback ? options.open_feedback : null;
    }
}