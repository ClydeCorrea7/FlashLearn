/**
 * Simple rate limiter and retry utility for API requests.
 * It queues requests and applies exponential backoff on rate limit (HTTP 429) responses.
 */
export type RequestOptions = RequestInit & {
  // Optional custom retry count
  retries?: number;
};

export async function requestWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
  const maxRetries = options.retries ?? 3;
  let attempt = 0;
  let delay = 200; // initial delay ms
  while (true) {
    const response = await fetch(url, options);
    if (!response.ok && response.status === 429 && attempt < maxRetries) {
      // Rate limit hit, wait and retry
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
      delay *= 2; // exponential backoff
      continue;
    }
    return response;
  }
}
