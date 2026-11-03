const fs = require('fs');
const { STYLES, colorTokens } = require('./common');
const { D } = require('./components');
const cmp = require('./compile');

// Compile screens so their styles and spacing land in the registries.
const P = ['auth', 'board-list', 'board-view', 'card-detail', 'labels', 'import-export'];
for (const p of P) for (const f of JSON.parse(fs.readFileSync('raw/' + p + '.json'))) { f.title = 'x'; cmp.compileFrame(f); }

const space = new Set(cmp.usedNums.space), radius = new Set(cmp.usedNums.radius);
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) return n.forEach(walk);
  if (n.t) {
    if (n.p != null) [].concat(n.p).forEach(v => v && space.add(v));
    if (n.g) space.add(n.g);
    if (n.cg) space.add(n.cg);
    if (n.r != null) [].concat(n.r).forEach(v => v && radius.add(v >= 999 ? 'full' : v));
  }
  for (const k of ['ch', 'root', 'variants']) if (n[k]) walk(n[k]);
  if (n.sl) Object.values(n.sl).forEach(walk);
})(D);
const num = s => [...s].filter(v => v !== 'full').map(Number).sort((a, b) => a - b);
const tokens = {
  colors: colorTokens(),
  space: num(space),
  radius: [...num(radius), 'full'],
  sizes: [['height/control-sm', 30, 'Small button'], ['height/control-md', 34, 'Button, filter button'], ['height/control-touch-sm', 38, 'Small button on phones'], ['height/control-touch', 44, 'Button and input on phones'], ['height/input', 36, 'Input'], ['height/icon-button-small', 28, 'Icon button in column headers'], ['height/icon-button-medium', 32, 'Icon button'], ['height/icon-button-large', 40, 'Icon button in the phone app bar']],
  textStyles: [...STYLES.values()].sort((a, b) => a.name.localeCompare(b.name)),
  effects: [
    { name: 'Shadow/Small', desc: '--sh1 · tiles, outlined buttons, inputs', fx: [['shadow/small', 0, 1, 2, 0]] },
    { name: 'Shadow/Popover', desc: '--sh-pop · menus, popovers, dialogs, toasts', fx: [['shadow/popover-1', 0, 10, 30, 0], ['shadow/popover-2', 0, 2, 6, 0]] },
    { name: 'Shadow/Drag', desc: '--sh-drag · card being dragged', fx: [['shadow/drag-1', 0, 14, 30, 0], ['shadow/drag-2', 0, 2, 6, 0]] },
    { name: 'Shadow/Panel', desc: '--sh-panel · card detail side panel', fx: [['shadow/panel', -12, 0, 32, 0]] },
    { name: 'Shadow/Raised', desc: 'Pinned phone app bar after scrolling', fx: [['shadow/raised', 0, 1, 8, 0]] },
    { name: 'Focus/Accent', desc: '3px focus ring (accent soft)', fx: [['accent/soft', 0, 0, 0, 3]] },
    { name: 'Focus/Danger', desc: '3px error ring (danger soft)', fx: [['danger/soft', 0, 0, 0, 3]] },
  ],
};
fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 1));
console.log('colors', tokens.colors.length, 'space', tokens.space.join(','), 'radius', tokens.radius.join(','), 'text styles', tokens.textStyles.length);
console.log(tokens.textStyles.map(s => s.name).join('\n'));
