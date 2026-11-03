const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
const ALL_FILL = ['FRAME_FILL', 'SHAPE_FILL'];
const C = [
  // name, css var, light, dark, scopes, description
  ['background/app', '--bg', '#F7F8FA', '#0D0F14', ALL_FILL, 'App background'],
  ['background/surface', '--surface', '#FFFFFF', '#161A22', [...ALL_FILL, 'STROKE_COLOR'], 'Cards, panels, dialogs'],
  ['background/column', '--col', '#EEF0F4', '#12151B', ALL_FILL, 'Column trays, read-only inputs'],
  ['background/sidebar', '--side', '#F2F4F7', '#101318', ALL_FILL, 'Sidebar background'],
  ['background/hover', '--hover', '#EEF1F5', '#1C212B', ALL_FILL, 'Hovered and highlighted rows'],
  ['background/skeleton', '--skel', '#E7EAEF', '#1B1F28', ALL_FILL, 'Loading skeleton base'],
  ['background/skeleton-highlight', '--skel-hi', '#F3F5F8', '#252B36', ALL_FILL, 'Loading skeleton shimmer'],
  ['background/scrim', '--scrim', [15, 18, 28, 0.32], [0, 0, 0, 0.55], ALL_FILL, 'Overlay behind dialogs and sheets'],
  ['background/toast', '--toast-bg', '#151821', '#E7E9EF', ALL_FILL, 'Toast background'],
  ['text/primary', '--fg', '#151821', '#E7E9EF', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Primary text'],
  ['text/muted', '--muted', '#5F6676', '#8C93A3', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Secondary text, metadata, icons'],
  ['text/faint', '--faint', '#98A0AE', '#5D6474', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Placeholders, disabled'],
  ['text/on-accent', '--accent-fg', '#FFFFFF', '#0B0E16', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Text and icons on accent fills'],
  ['text/on-danger', null, '#FFFFFF', '#FFFFFF', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Text and icons on danger fills (#fff in both themes)'],
  ['text/toast', '--toast-fg', '#F3F4F7', '#0D0F14', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Toast text'],
  ['border/default', '--line', '#E1E4EA', '#232833', ['STROKE_COLOR', ...ALL_FILL], 'Borders and dividers'],
  ['border/strong', '--line-strong', '#CBD0D9', '#343B48', ['STROKE_COLOR', ...ALL_FILL], 'Inputs, outlined buttons'],
  ['border/accent-subtle', null, [43, 89, 240, 0.25], [92, 128, 255, 0.25], ['STROKE_COLOR'], 'Info banner border (accent 25%)'],
  ['border/danger-subtle', null, [210, 59, 59, 0.3], [255, 107, 107, 0.3], ['STROKE_COLOR'], 'Error banner border (danger 30%)'],
  ['accent/default', '--accent', '#2B59F0', '#5C80FF', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Primary actions, focus, selection'],
  ['accent/hover', '--accent-hover', '#2149D6', '#7491FF', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Hovered primary actions'],
  ['accent/soft', '--accent-soft', '#E7EDFE', '#1A2440', [...ALL_FILL, 'STROKE_COLOR', 'EFFECT_COLOR'], 'Selected backgrounds, focus rings'],
  ['danger/default', '--danger', '#D23B3B', '#FF6B6B', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Destructive actions, errors'],
  ['danger/soft', '--danger-soft', '#FDECEC', '#3A1818', [...ALL_FILL, 'EFFECT_COLOR'], 'Error backgrounds, error focus ring'],
  ['success/default', '--success', '#1F9D57', '#3FCB7E', ['TEXT_FILL', 'STROKE_COLOR', ...ALL_FILL], 'Confirmations'],
  ['success/soft', '--success-soft', '#E5F6EC', '#132A1D', ALL_FILL, 'Success backgrounds'],
  ['shadow/small', null, [20, 24, 40, 0.06], [255, 255, 255, 0.03], ['EFFECT_COLOR'], '--sh1'],
  ['shadow/popover-1', null, [20, 24, 40, 0.14], [0, 0, 0, 0.55], ['EFFECT_COLOR'], '--sh-pop, first layer'],
  ['shadow/popover-2', null, [20, 24, 40, 0.06], [255, 255, 255, 0.02], ['EFFECT_COLOR'], '--sh-pop, second layer'],
  ['shadow/drag-1', null, [20, 24, 40, 0.2], [0, 0, 0, 0.6], ['EFFECT_COLOR'], '--sh-drag, first layer'],
  ['shadow/drag-2', null, [20, 24, 40, 0.08], [0, 0, 0, 0], ['EFFECT_COLOR'], '--sh-drag, second layer'],
  ['shadow/panel', null, [20, 24, 40, 0.08], [0, 0, 0, 0.4], ['EFFECT_COLOR'], '--sh-panel'],
  ['shadow/raised', null, [20, 24, 40, 0.06], [0, 0, 0, 0.3], ['EFFECT_COLOR'], 'Pinned app bar after scrolling'],
];
const LABELS = [['Red', 0, 74], ['Orange', 22, 85], ['Amber', 38, 90], ['Yellow', 50, 82], ['Lime', 80, 62], ['Green', 130, 50], ['Emerald', 155, 62], ['Teal', 172, 62], ['Cyan', 188, 72], ['Sky', 200, 78], ['Blue', 218, 80], ['Indigo', 235, 68], ['Violet', 255, 70], ['Purple', 275, 62], ['Fuchsia', 295, 62], ['Pink', 325, 70], ['Rose', 345, 74], ['Brown', 25, 38], ['Olive', 62, 32], ['Slate', 215, 16]];
function colorTokens() {
  const rgba = v => typeof v === 'string' ? [...hex(v), 1] : v;
  const out = C.map(([name, css, l, d, scopes, desc]) => ({ name, web: css ? `var(${css})` : null, light: rgba(l), dark: rgba(d), scopes, desc }));
  for (const [n, h, s] of LABELS) out.push({ name: 'label/' + n.toLowerCase(), web: null, light: [...hsl(h, s, 50), 1], dark: [...hsl(h, s, 64), 1], scopes: ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'], desc: `${n} label · hsl(${h} ${s}% 50%/64%)` });
  return out;
}
const STYLES = new Map();
const WN = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
function styleName(fam, size, weight, lh, ls, upper) {
  size = Math.round(size * 10) / 10;
  const lhp = Math.round(lh / size * 100);
  const lsp = Math.round(ls / size * 1000) / 10;
  let last = lhp + '%';
  if (lsp) last += ' · ' + (lsp > 0 ? '+' : '') + lsp + '% LS';
  if (upper) last += ' · Caps';
  const o = { name: `${fam}/${size} ${WN[weight]}/${last}`, fam, size, weight: +weight, lh: lhp, ls: lsp, upper: !!upper };
  STYLES.set(o.name, o);
  return o;
}
// S('Sans', 13.5, 500, 1.45) — lh given as a ratio, ls in em
function S(fam, size, weight, lhRatio, lsEm, upper) {
  return styleName(fam, size, weight, size * lhRatio, (lsEm || 0) * size, upper).name;
}
const ICONS = ['more', 'board', 'plus', 'label', 'trash', 'edit', 'refresh', 'log-out', 'boards', 'search', 'close', 'chevron-down', 'upload', 'chevron-left', 'close-small', 'filter', 'check', 'alert', 'rename', 'file', 'download', 'cloud-off', 'info', 'arrow-left', 'arrow-right', 'columns', 'chevron-right'];
module.exports = { STYLES, colorTokens, styleName, S, ICONS, LABELS, hex, hsl };
