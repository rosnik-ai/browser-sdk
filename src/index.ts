import { getStoredJourneyId } from "./journey";
import { InteractionType, RosnikEvent, UserFeedbackTrackEvent, UserGoalSuccessEvent, UserInteractionTrackEvent } from "./events";
import { Metadata } from "./metadata";
import fetchIntercept from 'fetch-intercept';
import { ulid } from "ulidx";
import Cookies from "js-cookie";
import { ConfigStore } from "./config";

export interface RosnikConfiguration {
  apiKey: string;
  allowedDomains?: string[];
  environment?: string;
}

export class Rosnik {
  private static unregister: () => void;

  private constructor() {}

  static init(config: RosnikConfiguration) {
    const deviceId = this.initDeviceIdCookie()
    ConfigStore.setConfig({
      ...config,
      deviceId
    });
    

    this.unregister = () => {};
    if (config.allowedDomains) {
      this.unregister = fetchIntercept.register({
        request: function (url, config) {
          if (
            !ConfigStore.getAllowedDomains() ||
            ConfigStore.getAllowedDomains().some((domain) =>
              url.toString().includes(domain),
            )
          ) {
            const storedJourneyId = getStoredJourneyId()
            let headers: { [key: string]: string } = config.headers || {};
            if (storedJourneyId) headers["X-ROSNIK-Journey-Id"] = storedJourneyId
            return [url, { headers, ...config }];
          }

          // Don't modify if it's not on the flight path. 
          return [url, config]
        },
      });
    }
  }

  static setUser(userId: string) {
    ConfigStore.setUserId(userId);
  }

  private static initDeviceIdCookie() {
    const existingCookie = Cookies.get("rosnik-device-id")
    if (existingCookie) return existingCookie

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9); // Set expiry date to 9 months from now
    const deviceId = ulid()
    Cookies.set('rosnik-device-id', deviceId, { expires: 30 * 9, sameSite: "Lax" })
    return deviceId
  }

  static trackUserAIRequest({ userInput, context }: { userInput?: string, context?: Record<string, any>}) {
    const event = new UserInteractionTrackEvent({
      interaction_type: InteractionType.AI_REQUEST,
      _metadata: new Metadata(),
      context: {...context, user_input: userInput}
    })
    this.track(event)
  }


  static trackUserTextEdit({before, after, context}: {before: string, after: string, context?: Record<string, any>}) {
    const event = new UserInteractionTrackEvent({
      interaction_type: InteractionType.EDIT_TEXT,
      _metadata: new Metadata(),
      context: {...context, before: before, after: after}
    })
    this.track(event)
  }

  static trackUserGoal({ goalName, context }: {goalName: string, context?: Record<string, any>}) {
    const event = new UserGoalSuccessEvent({
      _metadata: new Metadata(),
      context: {...context, goal_name: goalName}
    })
    this.track(event)
  }

  static trackUserFeedback({ score, openFeedback }: { score?: number; openFeedback?: string }) {
    const event = new UserFeedbackTrackEvent({
      score: score,
      open_response: openFeedback,
      _metadata: new Metadata(),
    })
    this.track(event)
  }

  static track(event: RosnikEvent) {
    // Store the last even we processed, so 
    // we can generate journey IDs from it
    // if needed.
    event.store()

    fetch("https://ingest.rosnik.ai/api/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ConfigStore.getApiKey()}`,
      },
      body: JSON.stringify(event),
    }).catch(console.error);
  }
}
