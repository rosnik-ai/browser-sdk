export type EventType = 
    "ai.generation.start" | 
    "ai.generation.finish" | 
    "user.goal.success" | 
    "user.journey.start" | 
    "user.interaction.track" | 
    "user.feedback.track";

export interface Configuration {
    apiKey: string,
    sessionTimeout: number,
    allowedDomains?: string[]
}

export interface EventPayload {
    type?: "text" | "media" | "Search" | "text-stream" | "User_modification" | "Request",
    input?: any,
    [key: string]: any 
}

export class SDK {
    private config!: Configuration;
    private originalFetch: any;
    
    init(config: Configuration) {
        this.config = config;
        this.originalFetch = window.fetch;
        window.fetch = (...args: Parameters<typeof fetch>) => this.patchFetch(...args);
    }

    track(eventType: EventType, payload: EventPayload) {
        const event = {
            eventType,
            ...payload
        };
        this.originalFetch('https://api.example.com/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': this.config.apiKey },
            body: JSON.stringify(event),
        });
    }

    private patchFetch(input: RequestInfo | URL, init: RequestInit | undefined = {}): Promise<Response> {
        if (!this.config.allowedDomains
            || this.config.allowedDomains.some(domain => input.toString().includes(domain))) 
        {
            init.headers = {
                ...init.headers,
                'X-Session-Id': 'session-id',  // obtain actual session id
            };
        }
        return this.originalFetch.call(window, input, init);
    }
}