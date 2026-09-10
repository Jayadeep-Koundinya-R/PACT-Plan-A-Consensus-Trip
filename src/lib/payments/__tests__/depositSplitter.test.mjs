import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDepositSplit,
  generatePaymentDeepLinks,
} from '../depositSplitter.ts';

describe('1-Tap Deposit Splitter & Payment Deep Links', () => {
  const members = [
    { id: 'm1', name: 'Jayadeep', isOrganizer: true },
    { id: 'm2', name: 'Maya' },
    { id: 'm3', name: 'Rohan' },
  ];

  const payee = {
    name: 'Jayadeep',
    upiVpa: 'jayadeep@oksbi',
    revolutHandle: 'jayadeepk',
    venmoHandle: 'jayadeep-k',
  };

  it('guarantees split sum precisely equals total deposit down to the cent without penny leakage', () => {
    const totalDeposit = 1000; // 1000 / 3 = 333.33 + 333.33 + 333.34
    const plan = calculateDepositSplit('c1', 'Goa Trip', totalDeposit, 'INR', members, payee);

    assert.equal(plan.shares.length, 3);
    const sum = plan.shares.reduce((acc, s) => acc + s.amount, 0);
    assert.equal(Number(sum.toFixed(2)), totalDeposit);

    // Check organizer status is marked paid
    const org = plan.shares.find((s) => s.isOrganizer);
    assert.equal(org?.status, 'paid');
  });

  it('generates compliant UPI deep link URI with required parameters', () => {
    const links = generatePaymentDeepLinks(350.5, 'INR', 'Goa Trip', payee);

    assert.ok(links.upiUri);
    assert.ok(links.upiUri.startsWith('upi://pay?'));
    assert.ok(links.upiUri.includes('pa=jayadeep%40oksbi') || links.upiUri.includes('pa=jayadeep@oksbi'));
    assert.ok(links.upiUri.includes('am=350.50'));
    assert.ok(links.upiUri.includes('cu=INR'));
  });

  it('generates compliant Revolut and Venmo URLs', () => {
    const links = generatePaymentDeepLinks(120, 'USD', 'Paris Weekend', payee);

    assert.ok(links.revolutUrl);
    assert.equal(links.revolutUrl, 'https://revolut.me/jayadeepk?amount=120.00&currency=USD');

    assert.ok(links.venmoUri);
    assert.ok(links.venmoUri.startsWith('venmo://paycharge?'));
    assert.ok(links.venmoUri.includes('recipients=jayadeep-k'));
    assert.ok(links.venmoUri.includes('amount=120.00'));
  });

  it('generates clean shareable summary text without missing fields', () => {
    const plan = calculateDepositSplit('c1', 'Goa Trip', 900, 'INR', members, payee);
    assert.ok(plan.shareableSummary.includes('*PACT Deposit Split — Goa Trip*'));
    assert.ok(plan.shareableSummary.includes('Total Booking Deposit: INR 900.00'));
    assert.ok(plan.shareableSummary.includes('Organized by: Jayadeep'));
  });
});
