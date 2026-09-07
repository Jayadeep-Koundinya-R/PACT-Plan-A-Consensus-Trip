/**
 * PACT Push Notification Service
 * Cross-platform notification management with strict privacy policy enforcement.
 *
 * CRITICAL PRIVACY RULE: Notification payloads must NEVER include private personal data:
 * - NO budget numbers ($400, $1200, etc.)
 * - NO individual vetoes or dealbreakers ("shared bath", "vetoed", etc.)
 * - Only generic status messages:
 *   e.g. "Jordan hasn't responded yet", "Voting closes in 2 hours", "Consensus reached on Goa trip!"
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Regex to detect budget figures or private financial amounts
const BUDGET_REGEX = /\$\s*\d+|\b\d+\s*(?:dollars?|usd|eur|gbp|inr)\b|\b(?:budget|cost|price)\s*(?:is|of|:)?\s*\$?\d+/i;
// Regex to detect individual dealbreakers or vetoes
const VETO_REGEX = /veto|dealbreaker|shared bath|dorm|hostel|disqualified|rejected/i;

/**
 * Validates that notification text conforms to PACT privacy constraints.
 * Throws or returns false if any private data is present.
 */
export function validateNotificationPrivacy(title: string, body: string): { valid: boolean; reason?: string } {
  const combined = `${title} ${body}`;

  if (BUDGET_REGEX.test(combined)) {
    return {
      valid: false,
      reason: 'Notification content violates privacy policy: Budget amounts or numbers are strictly prohibited in push payloads.'
    };
  }

  if (VETO_REGEX.test(combined)) {
    return {
      valid: false,
      reason: 'Notification content violates privacy policy: Vetoes or personal dealbreaker disclosures are strictly prohibited in push payloads.'
    };
  }

  return { valid: true };
}

/**
 * Helper to build a safe, privacy-compliant nudge notification
 */
export function buildNudgeNotification(userName: string, tripName: string = 'your trip'): NotificationPayload {
  const cleanName = userName.replace(/[\$\d]/g, '').trim() || 'A member';
  const payload: NotificationPayload = {
    title: 'PACT Circle Reminder',
    body: `${cleanName} hasn't responded yet. Tap to view circle progress.`,
    data: { type: 'nudge' }
  };

  const validation = validateNotificationPrivacy(payload.title, payload.body);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return payload;
}

/**
 * Helper to build a safe deadline reminder notification
 */
export function buildDeadlineReminder(tripName: string, hoursRemaining: number): NotificationPayload {
  const payload: NotificationPayload = {
    title: 'Voting Deadline Approaching',
    body: `Voting closes in ${hoursRemaining} hours for ${tripName || 'your trip circle'}.`,
    data: { type: 'deadline', hoursRemaining }
  };

  const validation = validateNotificationPrivacy(payload.title, payload.body);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return payload;
}

/**
 * Helper to build a safe consensus-reached notification
 */
export function buildConsensusReached(tripName: string): NotificationPayload {
  const payload: NotificationPayload = {
    title: 'Consensus Reached! 🎉',
    body: `Consensus reached on ${tripName || 'your trip'}! Tap to view final trip brief.`,
    data: { type: 'consensus_reached' }
  };

  const validation = validateNotificationPrivacy(payload.title, payload.body);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return payload;
}

// In-memory notification history for app display & testing
const notificationHistory: Array<NotificationPayload & { timestamp: string }> = [];

export function getNotificationHistory() {
  return [...notificationHistory];
}

export function clearNotificationHistory() {
  notificationHistory.length = 0;
}

/**
 * Dispatches notification with strict privacy validation
 */
export async function sendPactNotification(payload: NotificationPayload): Promise<{ delivered: boolean; error?: string }> {
  const validation = validateNotificationPrivacy(payload.title, payload.body);
  if (!validation.valid) {
    console.error('BLOCKED NOTIFICATION:', validation.reason);
    return { delivered: false, error: validation.reason };
  }

  // Record into in-memory store
  notificationHistory.push({
    ...payload,
    timestamp: new Date().toISOString()
  });

  return { delivered: true };
}
