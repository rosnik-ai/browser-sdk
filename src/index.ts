import { getStoredJourneyId } from "./journey";
import { InteractionType, RosnikEvent, UserFeedbackTrackEvent, UserInteractionTrackEvent, getLastAIRequestInteractionId } from "./events";
import { Metadata } from "./metadata";
import fetchIntercept from 'fetch-intercept';
import {ulid} from "ulidx";
import Cookies from "js-cookie";

export interface Configuration {
  apiKey: string;
  allowedDomains?: string[];
}

export class SDK {
  private config!: Configuration;
  private unregister!: () => void;
  private deviceId!: string;
  private userId!: string;

  init(config: Configuration) {
    this.config = config;
    const sdk = this;
    this.deviceId = this.initDeviceIdCookie()
    this.userId = "anonymous";
    this.unregister = fetchIntercept.register({
      request: function (url, config) {
        if (
          !sdk.config.allowedDomains ||
          sdk.config.allowedDomains.some((domain) =>
            url.toString().includes(domain),
          )
        ) {
          const storedJourneyId = getStoredJourneyId()
          const storedInteractionId = getLastAIRequestInteractionId()
          let headers: { [key: string]: string } = config.headers || {};
          if (storedJourneyId) headers["X-ROSNIK-Journey-Id"] = storedJourneyId
          if (storedInteractionId) headers["X-ROSNIK-Interaction-Id"] = storedInteractionId
          if (sdk.deviceId) headers["X-ROSNIK-Device-Id"] = sdk.deviceId
          return [url, { headers, ...config }];
        }
        // Don't modify if it's not on the flight path. 
        return [url, config]
      },
    });
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  private initDeviceIdCookie() {
    const existingCookie = Cookies.get("rosnik-device-id")
    if (existingCookie) return existingCookie

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9); // Set expiry date to 9 months from now
    // TODO: probably needs some unique cookie domain / value scoping?
    const deviceId = ulid()
    Cookies.set('rosnik-device-id', deviceId, { expires: 30 * 9, sameSite: "Lax" })
    return deviceId
  }

  trackUserAIRequest() {
    const event = new UserInteractionTrackEvent({
      user_id: this.userId,
      device_id: this.deviceId,
      interaction_type: InteractionType.AI_REQUEST,
      // TODO: function finger printing
      _metadata: new Metadata([])
    })
    this.track(event)
  }

  trackUserInteraction(interactionType: InteractionType) {
    const event = new UserInteractionTrackEvent({
      user_id: this.userId,
      device_id: this.deviceId,
      interaction_type: interactionType,
      // TODO: function finger printing
      user_interaction_id: interactionType === InteractionType.AI_REQUEST ? null : getLastAIRequestInteractionId(),
      _metadata: new Metadata([])
    })
    this.track(event)
  }

  trackUserFeedback({ score, openFeedback }: { score?: number; openFeedback?: string }) {
    const event = new UserFeedbackTrackEvent({
      user_id: this.userId,
      device_id: this.deviceId,
      score: score,
      open_feedback: openFeedback,
      user_interaction_id: getLastAIRequestInteractionId(),
      _metadata: new Metadata([])
    })
    this.track(event)
  }

  private track(event: RosnikEvent) {
    // Store the last even we processed, so 
    // we can generate journey IDs from it
    // if needed.
    event.store()

    fetch("https://ingest.rosnik.ai/api/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(event),
    }).then(console.log).catch(console.log);
  }
}
