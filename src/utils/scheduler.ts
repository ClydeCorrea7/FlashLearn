import { requestWithRetry } from './rateLimiter';

/**
 * Simple spaced repetition scheduler based on SM-2 algorithm.
 * Provides next review date calculation for a given quality (0-5).
 */
export interface CardSchedule {
  interval: number; // days until next review
  repetitions: number; // how many times reviewed successfully
  ef: number; // easiness factor
}

export function scheduleNextReview(prev: CardSchedule, quality: number): CardSchedule {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, quality));
  let { interval, repetitions, ef } = prev;
  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetitions += 1;
    // Update easiness factor
    ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  } else {
    // Reset on failure
    repetitions = 0;
    interval = 1;
  }
  return { interval, repetitions, ef };
}

/**
 * Example usage with API integration.
 */
export async function updateCardSchedule(cardId: string, quality: number) {
  // Fetch current schedule (placeholder)
  const response = await requestWithRetry(`/api/cards/${cardId}/schedule`, { method: 'GET' });
  const current: CardSchedule = await response.json();
  const updated = scheduleNextReview(current, quality);
  await requestWithRetry(`/api/cards/${cardId}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
  return updated;
}
