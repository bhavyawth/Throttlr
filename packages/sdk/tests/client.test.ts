// =============================================================================
// @throttlr/sdk — Client Tests
//
// What goes here:
//  - Unit tests for RateLimiter.check() using mocked axios
//  - Test: allowed request returns CheckResult with allowed=true
//  - Test: denied request returns CheckResult with allowed=false
//  - Test: network error throws ThrottlrError
//  - Test: 429 response throws RateLimitError with retryAfterMs populated
//  - Integration test stubs (marked .skip) for live API testing
// =============================================================================

// TODO: Import RateLimiter and mock axios
// TODO: Write unit tests using jest.mock('axios')

describe("RateLimiter", () => {
  it.todo("should return allowed=true when under the rate limit");
  it.todo("should return allowed=false when over the rate limit");
  it.todo("should include retryAfterMs in the response when rate limited");
  it.todo("should throw on network errors");
});
