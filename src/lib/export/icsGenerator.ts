let Platform: any = { OS: 'web' };
try {
  Platform = require('react-native').Platform || Platform;
} catch {
  // Safe fallback for Node test environment
}

export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  attendees?: string[];
}

/**
 * Sanitizes text fields for iCalendar (RFC 5545) formatting.
 * Escapes backslashes, semicolons, commas, and normalizes all newlines to '\n'.
 * Prevents CRLF / iCalendar property injection vulnerabilities.
 */
export function escapeICSValue(value: string = ''): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function generateICSContent(event: CalendarEventDetails): string {
  const formatICSDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') {
      const fallback = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return fallback + 'T090000Z';
    }
    const clean = dateStr.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0].replace(/-/g, '') + 'T090000Z';
      }
      return new Date().toISOString().split('T')[0].replace(/-/g, '') + 'T090000Z';
    }
    return clean.replace(/-/g, '') + 'T090000Z';
  };

  const startFormatted = formatICSDate(event.startDate);
  const endFormatted = formatICSDate(event.endDate);
  const nowFormatted = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PACT//Plan A Consensus Trip//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:pact-${Date.now()}@pact.app`,
    `DTSTAMP:${nowFormatted}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:🌴 ${escapeICSValue(event.title)}`,
    `DESCRIPTION:${escapeICSValue(event.description)}`,
    `LOCATION:${escapeICSValue(event.location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'DESCRIPTION:Reminder: PACT Trip Tomorrow!',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadICSFile(event: CalendarEventDetails): boolean {
  try {
    const icsData = generateICSContent(event);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
    return true;
  } catch (err) {
    console.error('Error exporting ICS:', err);
    return false;
  }
}
