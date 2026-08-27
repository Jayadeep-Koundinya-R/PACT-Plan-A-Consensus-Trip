import { Platform } from 'react-native';

export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  attendees?: string[];
}

export function generateICSContent(event: CalendarEventDetails): string {
  const formatICSDate = (dateStr: string) => {
    return dateStr.replace(/-/g, '') + 'T090000Z';
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
    `SUMMARY:🌴 ${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
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
