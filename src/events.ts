import { getOrCreateJourneyId } from './journey';
import { Metadata } from "./metadata"
import { monotonicFactory } from 'ulidx'

const ulid = monotonicFactory();

export class RosnikEvent {
    event_id: string;
    event_type: string;
    journey_id: string;
    sent_at: number;
    occurred_at: number | null;
    context: Record<string, any> | null;
    user_id: string | null;
    _metadata: Metadata;

    constructor(
        options: {
            event_type: string,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            _metadata: Metadata
        }
    ) {
        this.event_id = ulid();
        this.event_type = options.event_type;
        this.journey_id = getOrCreateJourneyId(this.event_id);
        this.sent_at = Math.floor(Date.now() / 1000);
        this.occurred_at = options.occurred_at ? options.occurred_at : null;
        this.context = options.context ? options.context : null;
        this.user_id = options.user_id ? options.user_id : null;
        this._metadata = options._metadata;
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
            _metadata: Metadata
        }
    ) {
        super({ ...options });
        this.user_properties = options.user_properties ? options.user_properties : null;
    }
}

export class UserInteractionTrackEvent extends UserEvent {
    event_type: string = "user.interaction.track";
    interaction_type: string;

    constructor(
        options: {
            user_properties?: Record<string, any> | null,
            occurred_at?: number | null,
            context?: Record<string, any> | null,
            user_id?: string | null,
            _metadata: Metadata,
            interaction_type: string
        }
    ) {
        super({ ...options, event_type: "user.interaction.track" });
        this.interaction_type = options.interaction_type;
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
            _metadata: Metadata,
            score?: number,
            open_feedback?: string
        }
    ) {
        super({ ...options, event_type: "user.interaction.track" });
        this.score = options.score ? options.score : null;
        this.open_feedback = options.open_feedback ? options.open_feedback : null;
    }
}