const fs = require('fs');
const t = fs.readFileSync('prisma/seed.ts','utf8');
const re = /title:\s*'([^']+)'/g;
const titles = [];
let m;
while ((m = re.exec(t)) !== null) titles.push(m[1]);
const slugs = titles.map(t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
const counts = {};
slugs.forEach(s=>{counts[s]=(counts[s]||0)+1});
const dups = Object.entries(counts).filter(([k,v])=>v>1);
console.log('Total titles:', titles.length, 'Unique slugs:', Object.keys(counts).length);
if(dups.length>0) { console.log('Duplicates:'); dups.forEach(([k,v])=>console.log('  ', k, 'x'+v)); }
