import { ConfigStore } from './config';
import { getOrCreateJourneyId } from './journey';
import { Metadata } from "./metadata";
import { monotonicFactory } from 'ulidx';

const ulid = monotonicFactory();
export const LAST_EVENT_ID_KEY = "ROSNIK_LAST_EVENT_ID"

export function getLastProcessedEventId() {
    return localStorage.getItem(LAST_EVENT_ID_KEY)
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
        this.user_id = ConfigStore.getUser()
        this.device_id = ConfigStore.getDeviceId()
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
            user_interaction_id?: string | null;
            _metadata: Metadata
        }
    ) {
        super({ ...options });
        this.user_properties = options.user_properties ? options.user_properties : null;
    }
}

export enum InteractionType {
    AI_REQUEST = "ai_request",
    EDIT_TEXT = "edit_text",
}

export class UserInteractionTrackEvent extends UserEvent {
    event_type: string = "user.interaction.track";

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            _metadata: Metadata,
            interaction_type: InteractionType,
            user_interaction_id?: string | null;
        }
    ) {
        super({ ...options, event_type: `user.interaction.track.${options.interaction_type}` });
    }
}

export class UserFeedbackTrackEvent extends UserEvent {
    event_type: string = "user.feedback.track";
    score: number | null;
    open_response: string | null;

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            _metadata: Metadata,
            score?: number,
            open_response?: string
            user_interaction_id?: string | null;
        }
    ) {
        super({ ...options, event_type: "user.feedback.track" });
        this.score = options.score ? options.score : null;
        this.open_response = options.open_response ? options.open_response : null;
    }
}

export class UserGoalSuccessEvent extends UserEvent {
    event_type: string = "user.goal.success";

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            _metadata: Metadata,
            user_interaction_id?: string | null,
        }
    ) {
        super({ ...options, event_type: "user.goal.success" });
    }
}