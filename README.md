# browser-sdk

Frontend SDK

## Compatibility notes

We patch `fetch` using `fetch-intercept` so there are
some browsers where we won't automatically send headers
to the AI service: https://caniuse.com/?search=fetch