# browser-sdk

ROSNIK Browser SDK

## Getting Started

### Install

```sh
npm add @rosnik/browser-sdk
```

### Configuration

Then in your application code:

```js
import { Rosnik } from "@rosnik/browser-sdk"
Rosnik.init({
  apiKey: 'api-key',
  allowedDomains: ["api.example.com"]
})
```

We'll send Journey IDs to the domains allowed.
This allows you to connect events across the frontend and backend.
Alternatively, you can send these headers yourself by not setting
`allowedDomains`, in which case we won't patch `fetch`.

To set active user context:

```js
Rosnik.setUser("user-id")
```

## Tracking Events

You can track the following events:

1. User interactions, e.g. "edit text"

```js
Rosnik.trackUserTextEdit({before: string, after: string })
```

2. Explicit user feedback

```js
Rosnik.trackUserFeedback({ score: number, openFeedback: string });
```

3. Goal completion 

```js
Rosnik.trackUserGoal({goalName: string})
```


## Compatibility notes

We patch `fetch` using `fetch-intercept` so there are
some browsers where we won't automatically send headers
to the AI service: https://caniuse.com/?search=fetch