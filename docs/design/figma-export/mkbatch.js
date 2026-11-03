// node mkbatch.js out.png from to   -> packs component defs D[from..to) with the current registry
const fs = require('fs'); const { execFileSync } = require('child_process');
const { D } = require('./components');
const [out, a, b, extra] = process.argv.slice(2);
const st = JSON.parse(fs.readFileSync('state.json'));
const defs = [...(extra ? extra.split(',').map(i => D[+i]) : []), ...D.slice(+a, +b)];
fs.writeFileSync('batch.json', JSON.stringify({ defs, reg: st.components }));
console.log(defs.map(d => d.set).join(', '));
console.log(execFileSync('node', ['pack.js', out, 'batch.json', '--rt']).toString().trim());
