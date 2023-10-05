import { SDK, Configuration, EventPayload, EventType } from '../src/index';

describe('SDK', () => {
    let originalFetch: any;
    let mockFetch: any;
    let sdk: SDK;
    let config: Configuration = {
        apiKey: 'your-api-key',
        sessionTimeout: 5000,
        allowedDomains: ['https://api.example.com'],
    };

    beforeEach(() => {
        originalFetch = window.fetch;
        // Mock the fetch function
        mockFetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
        window.fetch = mockFetch;
        sdk = new SDK();
        sdk.init(config);
    });

    afterEach(() => {
        // Clean up - Restore the original fetch function
        window.fetch = originalFetch;
    });

    it('should send the event to server', async () => {
        const eventPayload: EventPayload = {
            type: "text",
            input: "test track"
        };
    
        sdk.track("user.journey.start", eventPayload);
    
        const expectedPayload = {
            eventType: "user.journey.start",
            ...eventPayload
        }
    
        const expectedHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'your-api-key',
        };
    
        expect(mockFetch).toBeCalledWith('https://api.example.com/analytics', {
            method: 'POST',
            headers: expectedHeaders,
            body: JSON.stringify(expectedPayload)
        });
    });

    // Add more tests - for success and error handling paths.
});