// node pack.js out.png <json-file> [--rt]   -> writes PNG whose pixels hold {rt?, d}
const fs = require('fs'); const { execFileSync } = require('child_process');
const [out, file, flag] = process.argv.slice(2);
const payload = { d: JSON.parse(fs.readFileSync(file, 'utf8')) };
if (flag === '--rt') payload.rt = fs.readFileSync(__dirname + '/rt.js', 'utf8');
fs.writeFileSync(out + '.json', JSON.stringify(payload));
console.log(execFileSync('python3', [__dirname + '/topng.py', out + '.json', out]).toString().trim(), 'bytes png,', (JSON.stringify(payload).length / 1024).toFixed(0), 'KB json');
