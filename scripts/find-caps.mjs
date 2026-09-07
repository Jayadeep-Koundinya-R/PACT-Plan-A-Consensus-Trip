// Find all-caps JSX text labels (for the copy discipline sweep).
// Stamp-type badges (SEALED, PRO, 100% CONSENSUS LOCKED ticket footers, brand
// subtitles) are intentional; the rest should become sentence case.
import fs from 'fs';
import path from 'path';

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

// uppercase text node >ALLCAPS...< (>=4 chars), excluding known brand/stamp tokens
const re = />\s*([A-Z][A-Z0-9 ,&'`/–—\-().%•·]+?)\s*</g;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const m = src.matchAll(re);
  for (const hit of m) {
    const label = hit[1].trim();
    if (label.length < 4) continue;
    console.log(`${f.split(path.sep).join('/')}: ${label}`);
  }
}