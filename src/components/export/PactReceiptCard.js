export function buildReceiptShareText(destinationName = 'Selected Destination', dates = 'Confirmed Window', memberCount = 5) {
  const cleanDest = destinationName || 'Selected Destination';
  const cleanDates = dates || 'Confirmed Window';
  const cleanCount = memberCount || 5;
  return `📜 THE PACT RECEIPT\n\n${cleanCount} Friends · 0 Arguments · 100% Sealed Agreement\n\n📍 Destination: ${cleanDest}\n📅 Dates: ${cleanDates}\n🔒 Agreement Status: 100% Consensus Locked\n\n✨ Sealed privately without endless WhatsApp debates.\n\nJoin or create your trip circle on PACT:\nhttps://pact.app/invite`;
}
