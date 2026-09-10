/**
 * PACT Sealed Story Card & Viral Social Export
 * Formats high-impact story cards and shareable viral receipts for Instagram, WhatsApp, and iMessage.
 */

export interface PactStoryDetails {
  circleName: string;
  winnerDestination: string;
  dates: string;
  memberCount: number;
  perPersonBudget: number;
  currency?: string;
  sealHash?: string;
}

export interface StorySharePayload {
  title: string;
  message: string;
  caption: string;
  hashtags: string[];
  url: string;
}

/**
 * Generates formatted story copy and share payloads
 */
export function generateStorySharePayload(details: PactStoryDetails): StorySharePayload {
  const currency = details.currency || '$';
  const sealTag = details.sealHash ? `SHA-256 Seal: ${details.sealHash.slice(0, 10)}...` : 'Cryptographically Sealed';

  const caption = [
    `✨ IT'S OFFICIAL! We locked in the trip on PACT!`,
    `📍 ${details.winnerDestination}`,
    `📅 ${details.dates}`,
    `👥 ${details.memberCount} Confirmed Friends`,
    `💰 ${currency}${details.perPersonBudget}/person (100% Budget Consensus)`,
    `🔒 ${sealTag}`,
    ``,
    `Zero group chat arguments. 100% private matching.`,
    `Plan your trip on PACT: https://pact.app`,
  ].join('\n');

  return {
    title: `PACT Confirmed: ${details.winnerDestination}`,
    message: caption,
    caption,
    hashtags: ['#PlanAConsensusTrip', '#PACT', '#GroupTravel', '#TravelConsensus', '#ZeroDrama'],
    url: 'https://pact.app',
  };
}
