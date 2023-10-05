type EventType =
  | "ai.generation.start"
  | "ai.generation.finish"
  | "user.goal.success"
  | "user.journey.start"
  | "user.interaction.track"
  | "user.feedback.track";

export interface Configuration {
  apiKey: string;
  sessionTimeout: number;
  allowedDomains?: string[];
}

// Define the custom type for each payload here
interface AIGenerationPayload {
  type: "ai.start" | "ai.finish";
  generationID?: string;
  timestamp: Date;
}

interface UserGoalPayload {
  type: "user.goal.success";
  goalID?: string;
  goalName?: string;
}

interface UserJourneyPayload {
  type: "user.journey.start";
  journeyID?: string;
  journeyName?: string;
}

interface UserInteractionPayload {
  type: "user.interaction.track";
  interactionType?: string;
  timestamp: Date;
}

interface UserFeedbackPayload {
  type: "user.feedback.track";
  feedbackText?: string;
}

type EventPayload =
  | AIGenerationPayload
  | UserGoalPayload
  | UserJourneyPayload
  | UserInteractionPayload
  | UserFeedbackPayload;

export class SDK {
  private config!: Configuration;
  private originalFetch: any;
  
  init(config: Configuration) {
    this.config = config;
    this.originalFetch = window.fetch;
    window.fetch = (...args: Parameters<typeof fetch>) =>
      this.patchFetch(...args);
  }

  aiGenerationStart(payload: AIGenerationPayload) {
    this.track("ai.generation.start", payload);
  }

  aiGenerationFinish(payload: AIGenerationPayload) {
    this.track("ai.generation.finish", payload);
  }

  userGoalSuccess(payload: UserGoalPayload) {
    this.track("user.goal.success", payload);
  }

  userJourneyStart(payload: UserJourneyPayload) {
    this.track("user.journey.start", payload);
  }

  userInteractionTrack(payload: UserInteractionPayload) {
    this.track("user.interaction.track", payload);
  }

  userFeedbackTrack(payload: UserFeedbackPayload) {
    this.track("user.feedback.track", payload);
  }

  private track(eventType: EventType, payload: EventPayload) {
    const event = {
      eventType,
      ...payload,
    };
    this.patchFetch("https://api.example.com/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(event),
    });
  }

  private patchFetch(
    input: RequestInfo | URL,
    init: RequestInit | undefined = {},
  ): Promise<Response> {
    if (
      !this.config.allowedDomains ||
      this.config.allowedDomains.some((domain) =>
        input.toString().includes(domain),
      )
    ) {
      init.headers = {
        ...init.headers,
        "X-Session-Id": "session-id", // obtain actual session id
      };
    }
    return this.originalFetch.call(window, input, init);
  }
}
