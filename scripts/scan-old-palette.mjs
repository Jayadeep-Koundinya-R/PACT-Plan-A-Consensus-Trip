// Scan for remaining old-palette hex values in app/ and src/.
import fs from 'fs';
import path from 'path';

const OLD = ['FF5A5F','3DE0A0','090A0F','13151E','1F2232','D4AF37','E0484D','22C58B','EF4444','8B8D98','F4F3F0','454857','6C6F7A','050608','B4B6C0','2E0805','052E20','3A0A0A','0F1017','1B1D27','2D3144','262938','0D0E15','181A26','FF8A8D','555866','F0B547','B4915A','7FC9A5','CFF3E4','2A2D3A','0B3B22'];
const hits = [];

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!/node_modules|__tests__|\.vercel|^dist$|^\.git$|^\.expo$/.test(f)) walk(p);
    } else if (/\.tsx?$/.test(f)) {
      if (p.split(path.sep).join('/') === 'src/theme/colors.ts') continue;
      const src = fs.readFileSync(p, 'utf8').toUpperCase();
      for (const c of OLD) {
        if (src.includes('#' + c)) hits.push(p.split(path.sep).join('/') + ' -> #' + c);
      }
    }
  }
}

walk('app');
walk('src');
console.log(hits.length ? hits.join('\n') : 'CLEAN — no old palette values remain');
