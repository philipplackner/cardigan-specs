// node mkscreens.js out.png page from to  |  node mkscreens.js out.png page i,j,k
const fs = require('fs'); const { execFileSync } = require('child_process');
const [out, page, a, b] = process.argv.slice(2);
const st = JSON.parse(fs.readFileSync('state.json'));
const all = JSON.parse(fs.readFileSync('screens.json'))[page];
const screens = a.includes(',') ? a.split(',').map(i => all[+i]) : all.slice(+a, +b);
fs.writeFileSync('batch.json', JSON.stringify({ reg: st.components, screens }));
console.log(screens.map(s => s.meta.group + ' / ' + s.meta.title).join('\n'));
console.log(execFileSync('node', ['pack.js', out, 'batch.json', '--rt']).toString().trim());
