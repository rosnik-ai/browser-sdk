import { RosnikEvent, UserFeedbackTrackEvent, UserInteractionTrackEvent } from "./events"
import { getStoredJourneyId } from "./journey";
import { Metadata } from "./metadata";

export interface Configuration {
  apiKey: string;
  sessionTimeout: number;
  allowedDomains?: string[];
}

export class SDK {
  private config!: Configuration;
  private originalFetch: any;
  
  init(config: Configuration) {
    this.config = config;
    this.originalFetch = window.fetch;
    window.fetch = (...args: Parameters<typeof fetch>) =>
      this.patchFetch(...args);
  }

  trackUserInteraction(userId: string, interactionType: string) {
    const event = new UserInteractionTrackEvent({
      user_id: userId,
      interaction_type: interactionType,
      // TODO: function finger printing
      _metadata: new Metadata([])
    })
    this.track(event)
  }

  trackUserFeedback(userId: string, { score, openFeedback }: {score?: number; openFeedback?: string}) {
    const event = new UserFeedbackTrackEvent({
      user_id: userId,
      score: score,
      open_feedback: openFeedback,
      _metadata: new Metadata([])
    })
    this.track(event)
  }

  private track(event: RosnikEvent) {
    console.log(JSON.stringify(event))
    this.patchFetch("https://ingest.rosnik.ai/api/v1/events", {
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
        // TODO: getStoredJourneyId()?
        "X-ROSNIK-Journey-Id": "fake-journey",
        // TODO: getLastInteractionId()?
        "X-ROSNIK-Interaction-Id": "fake-interaction"
      };
    }
    return this.originalFetch.call(window, input, init);
  }
}
