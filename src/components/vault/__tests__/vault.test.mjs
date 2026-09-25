import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { useGatherlyStore } from '../../../store/useGatherlyStore.js';

describe('The PACT Vault (Past Trips & Anniversary Reminders)', () => {
  test('useGatherlyStore pastTrips contains pre-seeded historical trips and supports toggleAnniversaryReminder', () => {
    const store = useGatherlyStore.getState();
    assert.ok(store.pastTrips.length >= 2, 'Store contains at least 2 pre-seeded historical trips');

    const initialToggleState = store.pastTrips[0].anniversaryReminder;
    store.toggleAnniversaryReminder('past-1');

    const updatedTrip = useGatherlyStore.getState().pastTrips.find((p) => p.id === 'past-1');
    assert.equal(updatedTrip?.anniversaryReminder, !initialToggleState, 'Toggles anniversary reminder boolean');
  });

  test('app/vault.tsx source code verifies golden key icon, wax seal status, and CTAs', () => {
    const vaultPath = path.join(process.cwd(), 'app/vault.tsx');
    assert.ok(fs.existsSync(vaultPath), 'app/vault.tsx file must exist');

    const code = fs.readFileSync(vaultPath, 'utf8');

    assert.ok(code.includes('The PACT Vault'), 'Displays The PACT Vault header');
    assert.ok(code.includes('#D4AF37'), 'Uses golden key color accent');
    assert.ok(code.includes('Sealed & Completed'), 'Displays Sealed & Completed status badge');
    assert.ok(code.includes('View Brief'), 'Provides View Brief CTA');
    assert.ok(code.includes('View Receipt'), 'Provides View Receipt CTA');
    assert.ok(code.includes('Switch'), 'Includes Anniversary Reminders switch toggle');
  });
});
