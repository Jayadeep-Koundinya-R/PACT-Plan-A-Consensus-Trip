// Copy sweep v2: whitespace-tolerant sentence-case of all-caps JSX labels.
// Keeps brand/stamp/ticket/LIVE tokens intentional.
import fs from 'fs';
import path from 'path';

const SENTENCE = {
  'ACTIVE CIRCLES': 'Active circles',
  'SUPERMAJORITY': 'Supermajority',
  'SEALED PRIVACY': 'Sealed privacy',
  'YOUR TRIP CIRCLES': 'Your trip circles',
  'DESTINATION': 'Destination',
  'YOUR FULL NAME': 'Your full name',
  'EMAIL ADDRESS': 'Email address',
  'PASSWORD': 'Password',
  'GROUP CONSENSUS STATUS': 'Group consensus status',
  'MEMBER RESPONSES': 'Member responses',
  'CIRCLE INVITE CODE': 'Circle invite code',
  'SYNCING SHARED ALBUM & CLOUD MEMORIES...': 'Syncing shared album & cloud memories\u2026',
  'AI BUDGET ADVISOR': 'AI budget advisor',
  'SEALED CONSENSUS VOUCHER': 'Sealed consensus voucher',
  'DETAILS & BOOKING SUMMARY': 'Details & booking summary',
  'CONFIRMED ATTENDEES (5)': 'Confirmed attendees (5)',
  'TRIP NAME': 'Trip name',
  'ESTIMATED TRAVELERS': 'Estimated travelers',
  'INVITE CODE': 'Invite code',
  'YOU HAVE BEEN INVITED TO JOIN': 'You have been invited to join',
  'ORGANIZER': 'Organizer',
  'MEMBERS': 'Members',
  'STATUS': 'Status',
  'ONE PASS  \u2022  WHOLE CIRCLE COVERED': 'One pass \u00b7 whole circle covered',
  'ONE PASS \u2022 WHOLE CIRCLE COVERED': 'One pass \u00b7 whole circle covered',
  'MOST POPULAR \u2014 SAVE 50%': 'Most popular \u2014 save 50%',
  'ACTIVE TRIP CIRCLES (2)': 'Active trip circles (2)',
  'PRIVACY SHIELD DEFAULTS': 'Privacy shield defaults',
  'CIRCLE NUDGES': 'Circle nudges',
  'ACCOUNT & PLAN': 'Account & plan',
  'LEADING OPTION': 'Leading option',
  'NUDGE': 'Nudge',
  'PRE-WRITTEN GENTLE NUDGE': 'Pre-written gentle nudge',
  'DEMO CONTROLLER': 'Demo controller',
  'EDGE-CASE ENGINE (JUDGE TOOL)': 'Edge-case engine (judge tool)',
  'AGREEMENT': 'Agreement',
  'VETO': 'Veto',
  'OFFICIAL DESTINATION': 'Official destination'
};

const files = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!/node_modules|__tests__|\.vercel|^dist$|^\.git$|^\.expo$/.test(f)) walk(p);
    } else if (/\.tsx$/.test(f)) files.push(p);
  }
}
walk('app');
walk('src/components');

// Match `>  LABEL  <` capturing left/right whitespace
const re = />(\s*)([A-Z0-9][A-Z0-9 ,&'`/–—\-().%•·]+?)(\s*)</g;
let total = 0;
let touched = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const before = src;
  src = src.replace(re, (m, wsL, label, wsR) => {
    const to = SENTENCE[label.trim()];
    if (to) {
      total++;
      return `>${wsL}${to}${wsR}<`;
    }
    return m;
  });
  if (src !== before) {
    fs.writeFileSync(f, src);
    touched++;
  }
}
console.log(`Files touched: ${touched}; replacements: ${total}`);