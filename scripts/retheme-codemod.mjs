// Retheme codemod: old coral/mint dark palette -> DESIGN_SYSTEM.md Ink/Brass/Petrol/Seal palette.
// One-shot migration tool. Run: node scripts/retheme-codemod.mjs
import fs from 'fs';
import path from 'path';

// Exact hex string replacements (case-insensitive on the literal).
const HEX_MAP = {
  // Backgrounds / surfaces
  '#050608': '#0C1120',
  '#090A0F': '#12182B',
  '#0B0F17': '#0E1424',
  '#0D0A0A': '#0C1120',
  '#0D0E15': '#0E1424',
  '#0F111A': '#0E1424',
  '#0F1017': '#161D33',
  '#13151E': '#1A2138',
  '#161824': '#1F2840',
  '#161926': '#1F2840',
  '#181A26': '#1F2840',
  '#181B26': '#1F2840',
  '#181E24': '#1F2840',
  '#1A1820': '#1F2840',
  '#1A202C': '#1F2840',
  '#1B1D27': '#222B45',
  '#1E2235': '#222B45',
  '#25293A': '#262F4C',
  '#0F172A': '#12182B',
  '#2D3144': '#303A55',
  '#262938': '#2A3350',
  '#1F2232': '#262E48',
  '#1E293B': '#2A3350',
  '#334155': '#323C58',
  // Primary: coral/terracotta -> Brass
  '#FF5A5F': '#C99A5B',
  '#E0484D': '#B98A4E',
  '#E24B4A': '#B98A4E',
  '#B54848': '#A97C3D',
  '#FF8A8D': '#D8B27A',
  // Danger / seal -> Sealing Red
  '#EF4444': '#C1503F',
  '#DC2626': '#A63D2F',
  '#F87171': '#D06B58',
  '#EC4899': '#C1503F',
  '#831843': '#7A2F23',
  '#BE185D': '#C1503F',
  '#9D174D': '#A63D2F',
  '#064E3B': '#3A241E',
  // Success / secondary: mint -> petrol-moss family
  '#3DE0A0': '#58A68C',
  '#22C58B': '#58A68C',
  '#10B981': '#58A68C',
  '#22C55E': '#58A68C',
  '#16A34A': '#58A68C',
  '#059669': '#3E7D63',
  '#047857': '#3E7D63',
  '#15803D': '#3E7D63',
  '#0F6E56': '#3E7D63',
  '#0B3B22': '#1E3A30',
  '#7FC9A5': '#8FB8A4',
  '#CFF3E4': '#D3E4DA',
  '#052E20': '#16301E',
  '#0D2A20': '#16301E',
  '#14291E': '#16301E',
  '#16241E': '#16301E',
  '#16241F': '#16301E',
  // Warning ambers -> brass-adjacent amber
  '#F59E0B': '#D99A3F',
  '#F0B547': '#E3B25E',
  '#B4915A': '#A98B5F',
  '#FBBF24': '#E3B25E',
  '#FFD700': '#E0C286',
  '#D4AF37': '#E0C286',
  '#D97706': '#B0782A',
  '#B45309': '#8A5F22',
  '#78350F': '#5C3E16',
  '#FFEDD5': '#F0E3C8',
  '#FFF7ED': '#F4EAD5',
  '#FED7AA': '#E8D4AE',
  '#C9924A': '#C99A5B',
  '#8A7433': '#8A6A33',
  '#3E2C0E': '#3A2C12',
  '#3A2B00': '#3A2C12',
  '#2A2416': '#33270F',
  // Text
  '#F4F3F0': '#F3EEE2',
  '#F8FAFC': '#F3EEE2',
  '#F1F5F9': '#F3EEE2',
  '#B4B6C0': '#C9C0AC',
  '#D4D5DA': '#C9C0AC',
  '#D1D5DB': '#C9C0AC',
  '#CBD5E1': '#C9C0AC',
  '#8B8D98': '#A9A08C',
  '#94A3B8': '#A9A08C',
  '#6C6F7A': '#8B8474',
  '#64748B': '#8B8474',
  '#454857': '#6B6455',
  '#555866': '#6B6455',
  '#2A2D3A': '#6B6455',
  // Contrast text on primary/success/reject
  '#2E0805': '#231A0C',
  '#3A0A0A': '#41201A',
  '#2D1515': '#3A241E',
  '#251C1C': '#3A241E',
  '#3A1F1F': '#3A241E',
  // Info blues -> light petrol
  '#60A5FA': '#4FA39B',
  '#38BDF8': '#4FA39B',
  '#0EA5E9': '#4FA39B',
  '#3B82F6': '#4FA39B',
  // Violet (vault doc tags) -> deep amber-brown
  '#A855F7': '#8A6A33',
  '#8B5CF6': '#8A6A33',

  // ---- SHARP & BRIGHT pass (2026-09-07): raise saturation/luminance of accents ----
  // Brass -> vivid gold
  '#C99A5B': '#F0B24A',
  '#B98A4E': '#D99836',
  '#D8B27A': '#F3C878',
  '#E0C286': '#FFD98A',
  '#8A6530': '#C8842A',
  // Petrol -> vivid teal
  '#58A68C': '#25C9A0',
  '#3E7D63': '#0FA47F',
  '#8FB8A4': '#6FD8B8',
  '#D3E4DA': '#C8F2E4',
  '#1E3A30': '#0B3327',
  '#16301E': '#0A2A1F',
  '#4FA39B': '#35C4A5',
  // Seal -> vivid vermilion
  '#C1503F': '#E14733',
  '#A63D2F': '#D6432B',
  '#D06B58': '#E96A50',
  '#7A2F23': '#8A2E1C',
  // Amber family -> vivid
  '#D99A3F': '#FFB224',
  '#E3B25E': '#FFC55C',
  '#A98B5F': '#C9A25E',
  '#B0782A': '#E08A00',
  '#8A5F22': '#B86E00',
  '#5C3E16': '#8A5500',
  '#8A6A33': '#B58722',
  '#3A2C12': '#4A3A14',
  '#33270F': '#403012',
  '#F0E3C8': '#FFEFC9',
  '#F4EAD5': '#FFF3D9',
  '#E8D4AE': '#F5DCA8',
  // Text: brighter warm neutrals
  '#F3EEE2': '#FDF9EF',
  '#A9A08C': '#C3BAA6',
  '#8B8474': '#9C947F',
  '#6B6455': '#7A7263',
  '#C9C0AC': '#D8D0BC',
  // Surfaces: more separation from Ink background
  '#1A2138': '#1E2742',
  '#222B45': '#28324F',
  '#161D33': '#182036',
  '#1F2840': '#242E4A',
  '#262F4C': '#2C3654',
  '#262E48': '#2B3552',
  '#303A55': '#384262',
  '#2A3350': '#323C5A',
  '#323C58': '#3A446A'
};

// rgba() functional replacements: old rgb triples -> new rgb triples (alpha preserved).
const RGB_MAP = [
  [/rgba\(\s*255\s*,\s*90\s*,\s*95\s*,/gi, 'rgba(201, 154, 91,'],   // coral -> brass
  [/rgba\(\s*61\s*,\s*224\s*,\s*160\s*,/gi, 'rgba(88, 166, 140,'],  // mint -> sea green
  [/rgba\(\s*16\s*,\s*185\s*,\s*129\s*,/gi, 'rgba(88, 166, 140,'],
  [/rgba\(\s*239\s*,\s*68\s*,\s*68\s*,/gi, 'rgba(193, 80, 63,'],    // danger red -> seal
  [/rgba\(\s*245\s*,\s*158\s*,\s*11\s*,/gi, 'rgba(217, 154, 63,'],  // amber
  [/rgba\(\s*217\s*,\s*119\s*,\s*6\s*,/gi, 'rgba(176, 120, 42,'],
  [/rgba\(\s*220\s*,\s*38\s*,\s*38\s*,/gi, 'rgba(166, 61, 47,'],
  [/rgba\(\s*22\s*,\s*163\s*,\s*74\s*,/gi, 'rgba(94, 154, 100,'],   // green -> moss
  [/rgba\(\s*9\s*,\s*10\s*,\s*15\s*,/gi, 'rgba(18, 24, 43,'],       // old ink bg scrim -> Ink
  [/rgba\(\s*5\s*,\s*6\s*,\s*8\s*,/gi, 'rgba(12, 17, 32,'],         // old deep bg scrim -> deep Ink

  // ---- SHARP & BRIGHT pass: accent rgba tints ----
  [/rgba\(\s*201\s*,\s*154\s*,\s*91\s*,/gi, 'rgba(240, 178, 74,'],  // brass tint -> gold tint
  [/rgba\(\s*88\s*,\s*166\s*,\s*140\s*,/gi, 'rgba(37, 201, 160,'],  // sea tint -> teal tint
  [/rgba\(\s*94\s*,\s*154\s*,\s*100\s*,/gi, 'rgba(15, 164, 127,'],  // moss tint -> vivid teal
  [/rgba\(\s*193\s*,\s*80\s*,\s*63\s*,/gi, 'rgba(225, 71, 51,'],    // seal tint -> vermilion
  [/rgba\(\s*166\s*,\s*61\s*,\s*47\s*,/gi, 'rgba(214, 67, 43,'],
  [/rgba\(\s*217\s*,\s*154\s*,\s*63\s*,/gi, 'rgba(255, 178, 36,'],  // amber tint
  [/rgba\(\s*176\s*,\s*120\s*,\s*42\s*,/gi, 'rgba(224, 138, 0,']
];

const SKIP_DIRS = /node_modules|__tests__|\.vercel|^dist$|web-build|\.git|\.expo/;
const ROOTS = ['app', 'src'];
const SKIP_FILES = new Set(['src/theme/colors.ts']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.test(entry)) walk(p, files);
    } else if (/\.tsx?$/.test(entry)) {
      files.push(p);
    }
  }
  return files;
}

const norm = (p) => p.split(path.sep).join('/');
let totalHex = 0;
let totalRgba = 0;
const touched = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (SKIP_FILES.has(norm(file))) continue;
    let src = fs.readFileSync(file, 'utf8');
    const before = src;
    let hexCount = 0;
    let rgbaCount = 0;

    src = src.replace(/'#[0-9A-Fa-f]{6}'/g, (m) => {
      const key = m.slice(1, -1).toUpperCase();
      const rep = HEX_MAP[key];
      if (rep) {
        hexCount++;
        return `'${rep}'`;
      }
      return m;
    });
    // bare #000 / #000000 literals in quotes — leave as-is (shadows).

    // Pass 3: catch double-quoted JSX attributes / template literals / bare tokens.
    const globalHexRe = new RegExp(
      '#(' + Object.keys(HEX_MAP).map((k) => k.slice(1)).join('|') + ')',
      'gi'
    );
    src = src.replace(globalHexRe, (m) => {
      const rep = HEX_MAP[m.toUpperCase()];
      if (rep) {
        hexCount++;
        return rep;
      }
      return m;
    });

    for (const [re, rep] of RGB_MAP) {
      src = src.replace(re, () => {
        rgbaCount++;
        return rep;
      });
    }

    // Pass 2: neutral white hairlines/borders -> warm parchment hairlines (DESIGN_SYSTEM.md border).
    // Only low-alpha border-ish values; white text/disabled states (>=0.4) untouched.
    src = src.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(0\.0[0-9]+|0\.1[0-9]+)\s*\)/gi, (m, a) => {
      const alpha = parseFloat(a);
      const WARM = { 0.04: 0.05, 0.05: 0.06, 0.06: 0.07, 0.07: 0.08, 0.08: 0.1, 0.09: 0.11, 0.1: 0.12, 0.11: 0.13, 0.12: 0.14, 0.13: 0.15, 0.14: 0.16, 0.15: 0.17, 0.16: 0.18 };
      const rounded = Math.round(alpha * 100) / 100;
      const mapped = WARM[rounded];
      if (mapped === undefined) return m;
      rgbaCount++;
      return `rgba(243, 238, 226, ${mapped})`;
    });

    // Pass 4: bump warm hairline alphas so borders/surfaces separate from Ink
    // (the sharpened palette lifts low-alpha strokes for contrast).
    src = src.replace(/rgba\(\s*243\s*,\s*238\s*,\s*226\s*,\s*(0\.[0-9]+)\s*\)/gi, (m, a) => {
      const alpha = parseFloat(a);
      const BUMP = { 0.05: 0.08, 0.06: 0.1, 0.07: 0.11, 0.08: 0.12, 0.09: 0.13, 0.1: 0.14, 0.11: 0.15, 0.12: 0.16, 0.13: 0.17, 0.14: 0.18, 0.15: 0.19, 0.16: 0.2, 0.17: 0.21, 0.18: 0.22 };
      const rounded = Math.round(alpha * 100) / 100;
      const mapped = BUMP[rounded];
      if (mapped === undefined) return m;
      rgbaCount++;
      return `rgba(253, 249, 239, ${mapped})`;
    });

    if (src !== before) {
      fs.writeFileSync(file, src);
      totalHex += hexCount;
      totalRgba += rgbaCount;
      touched.push(`${norm(file)}: ${hexCount} hex, ${rgbaCount} rgba`);
    }
  }
}

console.log(`Files touched: ${touched.length}`);
console.log(`Hex literals replaced: ${totalHex}`);
console.log(`rgba() calls replaced: ${totalRgba}`);
console.log('---');
console.log(touched.join('\n'));
