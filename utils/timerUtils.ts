export interface DetectedTimer {
  durationSeconds: number;
  label: string;
  actionText: string;
  matchedPhrase: string;
}

const ACTION_VERBS = [
  'simmer',
  'bake',
  'cook',
  'boil',
  'roast',
  'grill',
  'fry',
  'air fry',
  'sauté',
  'saute',
  'poach',
  'rest',
  'chill',
  'cool',
  'whisk',
  'steam',
  'marinate',
  'stand',
  'sit',
  'wait',
  'blend',
  'preheat',
];

/**
 * Scans an instruction string for cooking time expressions and suggests timers
 * Examples:
 * - "Poach for 3 minutes" -> 180s, "3 mins", "Poach for 3 mins"
 * - "Air fry for 10-12 minutes" -> 600s, "10-12 mins", "Air fry for 10-12 mins"
 * - "Let sit for 1 minute" -> 60s, "1 min", "Sit for 1 min"
 */
export function detectTimerInText(text: string): DetectedTimer | null {
  if (!text) return null;

  // Pattern 1: Action verb + optional words + "for" + number/range + unit
  // e.g. "simmer covered for 20 minutes", "air fry for 10-12 minutes", "bake for 15 mins"
  const verbListPattern = ACTION_VERBS.join('|');
  const actionRegex = new RegExp(
    `\\b(${verbListPattern})\\b(?:\\s+[a-zA-Z0-9-—]+){0,4}?\\s+for\\s+(?:at\\s+least\\s+)?(?:about\\s+)?(\\d+(?:\\.\\d+)?)(?:\\s*(?:-|to)\\s*(\\d+(?:\\.\\d+)?))?\\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)\\b`,
    'i'
  );

  const actionMatch = text.match(actionRegex);
  if (actionMatch) {
    const verb = actionMatch[1];
    const num1 = parseFloat(actionMatch[2]);
    const num2 = actionMatch[3] ? parseFloat(actionMatch[3]) : undefined;
    const unit = actionMatch[4].toLowerCase();

    // Pick lower bound for countdown (or average)
    const targetNum = num1;
    let seconds = 0;
    let label = '';

    if (unit.startsWith('h')) {
      seconds = targetNum * 3600;
      label = num2 ? `${num1}-${num2} hrs` : `${num1} hr${num1 > 1 ? 's' : ''}`;
    } else if (unit.startsWith('s')) {
      seconds = targetNum;
      label = num2 ? `${num1}-${num2} secs` : `${num1} sec${num1 > 1 ? 's' : ''}`;
    } else {
      seconds = targetNum * 60;
      label = num2 ? `${num1}-${num2} mins` : `${num1} min${num1 > 1 ? 's' : ''}`;
    }

    const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
    return {
      durationSeconds: Math.round(seconds),
      label,
      actionText: `${capitalizedVerb} for ${label}`,
      matchedPhrase: actionMatch[0],
    };
  }

  // Pattern 2: Generic "for X minutes" or "X minutes"
  const genericRegex = /\b(?:for\s+)?(?:about\s+)?(\d+(?:\.\d+)?)(?:\s*(?:-|to)\s*(\d+(?:\.\d+)?))?\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)\b/i;
  const genericMatch = text.match(genericRegex);
  if (genericMatch) {
    const num1 = parseFloat(genericMatch[1]);
    const num2 = genericMatch[2] ? parseFloat(genericMatch[2]) : undefined;
    const unit = genericMatch[3].toLowerCase();

    const targetNum = num1;
    let seconds = 0;
    let label = '';

    if (unit.startsWith('h')) {
      seconds = targetNum * 3600;
      label = num2 ? `${num1}-${num2} hrs` : `${num1} hr${num1 > 1 ? 's' : ''}`;
    } else if (unit.startsWith('s')) {
      seconds = targetNum;
      label = num2 ? `${num1}-${num2} secs` : `${num1} sec${num1 > 1 ? 's' : ''}`;
    } else {
      seconds = targetNum * 60;
      label = num2 ? `${num1}-${num2} mins` : `${num1} min${num1 > 1 ? 's' : ''}`;
    }

    return {
      durationSeconds: Math.round(seconds),
      label,
      actionText: `Timer for ${label}`,
      matchedPhrase: genericMatch[0],
    };
  }

  return null;
}

/**
 * Formats seconds into MM:SS (or HH:MM:SS)
 */
export function formatTimerRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

/**
 * Formats seconds into short human string like "5m" or "1m 30s"
 */
export function formatShortDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  if (remSecs === 0) return `${mins}m`;
  return `${mins}m ${remSecs}s`;
}
