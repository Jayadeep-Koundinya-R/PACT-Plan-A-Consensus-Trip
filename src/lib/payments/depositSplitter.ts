/**
 * PACT Pre-Trip Deposit Splitter & Instant Settlement Engine
 * Solves post-consensus payment collection with 1-tap deep links for UPI, Revolut, Venmo, and Splitwise.
 */

export interface PayeeProfile {
  name: string;
  upiVpa?: string; // e.g. "jayadeep@oksbi"
  revolutHandle?: string; // e.g. "jayadeep"
  venmoHandle?: string; // e.g. "jayadeep-k"
}

export interface SplitMemberShare {
  memberId: string;
  memberName: string;
  amount: number;
  currency: string;
  isOrganizer: boolean;
  status: 'pending' | 'paid';
}

export interface DepositSplitPlan {
  circleId: string;
  circleName: string;
  totalDeposit: number;
  currency: string;
  shares: SplitMemberShare[];
  sharePerPerson: number;
  deepLinks: {
    upiUri?: string;
    revolutUrl?: string;
    venmoUri?: string;
  };
  shareableSummary: string;
}

/**
 * Calculates equal split shares ensuring the sum of all parts equals the total deposit exactly.
 */
export function calculateDepositSplit(
  circleId: string,
  circleName: string,
  totalDeposit: number,
  currency: string,
  members: Array<{ id: string; name: string; isOrganizer?: boolean }>,
  payee: PayeeProfile
): DepositSplitPlan {
  const count = Math.max(1, members.length);
  const baseShare = Math.floor((totalDeposit / count) * 100) / 100;
  const remainderCents = Math.round((totalDeposit - baseShare * count) * 100);

  const shares: SplitMemberShare[] = members.map((m, idx) => {
    // Distribute remainder cents to first N members to guarantee exact sum
    const extra = idx < remainderCents ? 0.01 : 0;
    const amount = Number((baseShare + extra).toFixed(2));
    return {
      memberId: m.id,
      memberName: m.name,
      amount,
      currency,
      isOrganizer: Boolean(m.isOrganizer),
      status: m.isOrganizer ? 'paid' : 'pending',
    };
  });

  const sampleAmount = shares[0]?.amount || baseShare;
  const deepLinks = generatePaymentDeepLinks(sampleAmount, currency, circleName, payee);

  const shareableSummary = [
    `*PACT Deposit Split — ${circleName}*`,
    `Total Booking Deposit: ${currency} ${totalDeposit.toFixed(2)}`,
    `Per Person Share: ${currency} ${sampleAmount.toFixed(2)} (${count} members)`,
    `Organized by: ${payee.name}`,
    ...(deepLinks.upiUri ? [`UPI 1-Tap Pay: ${deepLinks.upiUri}`] : []),
    ...(deepLinks.revolutUrl ? [`Revolut Pay: ${deepLinks.revolutUrl}`] : []),
    ...(deepLinks.venmoUri ? [`Venmo Pay: ${deepLinks.venmoUri}`] : []),
  ].join('\n');

  return {
    circleId,
    circleName,
    totalDeposit,
    currency,
    shares,
    sharePerPerson: sampleAmount,
    deepLinks,
    shareableSummary,
  };
}

/**
 * Generates valid standard OS-level URI schemes for 1-tap mobile checkout.
 */
export function generatePaymentDeepLinks(
  amount: number,
  currency: string,
  circleName: string,
  payee: PayeeProfile
): { upiUri?: string; revolutUrl?: string; venmoUri?: string } {
  const links: { upiUri?: string; revolutUrl?: string; venmoUri?: string } = {};
  const note = encodeURIComponent(`PACT ${circleName} Deposit`);

  // 1. Indian UPI (Google Pay, PhonePe, Paytm, BHIM)
  if (payee.upiVpa) {
    const cu = currency.toUpperCase() === 'INR' ? 'INR' : 'INR';
    links.upiUri = `upi://pay?pa=${payee.upiVpa}&pn=${encodeURIComponent(payee.name)}&am=${amount.toFixed(2)}&cu=${cu}&tn=${note}`;
  }

  // 2. Revolut (Global / Europe / UK)
  if (payee.revolutHandle) {
    const handle = payee.revolutHandle.replace(/^@/, '');
    links.revolutUrl = `https://revolut.me/${handle}?amount=${amount.toFixed(2)}&currency=${currency.toUpperCase()}`;
  }

  // 3. Venmo (US)
  if (payee.venmoHandle) {
    const handle = payee.venmoHandle.replace(/^@/, '');
    links.venmoUri = `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount.toFixed(2)}&note=${note}`;
  }

  return links;
}
