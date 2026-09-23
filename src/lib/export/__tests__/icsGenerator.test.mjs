import test from 'node:test';
import assert from 'node:assert/strict';
import { generateICSContent, escapeICSValue } from '../icsGenerator.ts';

test('escapeICSValue sanitizes iCalendar special characters and newlines', () => {
  assert.equal(escapeICSValue('Hello, World!'), 'Hello\\, World!');
  assert.equal(escapeICSValue('A;B;C'), 'A\\;B\\;C');
  assert.equal(escapeICSValue('C:\\Folder\\File'), 'C:\\\\Folder\\\\File');
  assert.equal(escapeICSValue('Line 1\r\nLine 2\nLine 3'), 'Line 1\\nLine 2\\nLine 3');
});

test('generateICSContent escapes special characters in event fields', () => {
  const event = {
    title: 'Trip to Goa, India',
    description: 'Villas; Beach parties\nEnjoy the sun!',
    location: 'Goa, Beach; Resort \\ Stay',
    startDate: '2026-10-01',
    endDate: '2026-10-07'
  };

  const ics = generateICSContent(event);

  assert.ok(ics.includes('SUMMARY:🌴 Trip to Goa\\, India'));
  assert.ok(ics.includes('DESCRIPTION:Villas\\; Beach parties\\nEnjoy the sun!'));
  assert.ok(ics.includes('LOCATION:Goa\\, Beach\\; Resort \\\\ Stay'));
});

test('generateICSContent prevents CRLF injection in calendar title and location', () => {
  const malformedEvent = {
    title: 'Harmless Title\r\nSUMMARY:Injected Event Title',
    description: 'Normal description',
    location: 'Normal Location\nLOCATION:Fake Location',
    startDate: '2026-10-01',
    endDate: '2026-10-07'
  };

  const ics = generateICSContent(malformedEvent);

  // Ensure CRLF was sanitized into literal \n within the field value rather than creating a new line in the ICS file structure
  assert.ok(ics.includes('SUMMARY:🌴 Harmless Title\\nSUMMARY:Injected Event Title'));
  assert.ok(ics.includes('LOCATION:Normal Location\\nLOCATION:Fake Location'));
});
