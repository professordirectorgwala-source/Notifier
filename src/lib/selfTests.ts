import { circles, events, restaurants } from '../services/api';
import { formatRemaining } from './format';

let hasRun = false;

export function runSelfTests() {
  if (hasRun) {
    return;
  }

  hasRun = true;

  assert(restaurants.length > 0, 'restaurants array is not empty');
  assert(events.length > 0, 'events array is not empty');
  assert(circles.length > 0, 'circles array is not empty');
  assert(
    circles.every((circle) => ['exact', 'approx', 'hidden'].includes(circle.shareMode)),
    'every circle shareMode is valid',
  );
  assert(formatRemaining(59) === '00:59', 'formatRemaining(59) === 00:59');
  assert(formatRemaining(60) === '01:00', 'formatRemaining(60) === 01:00');
  assert(formatRemaining(65) === '01:05', 'formatRemaining(65) === 01:05');
  assert(formatRemaining(3602) === '1:00:02', 'formatRemaining(3602) === 1:00:02');

  console.log('Notifier self-checks passed.');
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Notifier self-check failed: ${message}`);
  }
}
