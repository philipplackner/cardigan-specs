const fs = require('fs');
const { colorTokens, styleName } = require('./common');
const icons = require('./icons.json');
const ICON_BY_SVG = {};
for (const [n, b] of Object.entries(icons)) ICON_BY_SVG[b.replace(/\s+/g, '')] = n;

// ---------- color mapping ----------
const TOKS = colorTokens();
const byLight = {};
for (const t of TOKS) { const k = t.light.slice(0, 3).join(',') + ',' + (+t.light[3].toFixed(2)); (byLight[k] = byLight[k] || []).push(t.name); }
function parseColor(s) {
  if (!s) return null;
  let m = s.match(/^rgba?\(([^)]+)\)/);
  if (m) { const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  m = s.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
  if (m) return [Math.round(m[1] * 255), Math.round(m[2] * 255), Math.round(m[3] * 255), m[4] == null ? 1 : +m[4]];
  return null;
}
const PREF = {
  fill: ['background/', 'accent/', 'danger/', 'success/', 'border/', 'text/', 'label/'],
  text: ['text/', 'accent/', 'danger/', 'success/', 'background/', 'border/'],
  stroke: ['border/', 'accent/', 'danger/', 'text/', 'background/', 'success/'],
};
let unmapped = {};
function tok(cssColor, role, ctx) {
  const c = parseColor(cssColor);
  if (!c || c[3] === 0) return null;
  const key = c.slice(0, 3).join(',') + ',' + (+c[3].toFixed(2));
  let cands = byLight[key];
  if (!cands) { unmapped[role + ' ' + cssColor] = (unmapped[role + ' ' + cssColor] || 0) + 1; return { raw: c }; }
  if (cands.length > 1) {
    const anc = ctx || '';
    if (key === '255,255,255,1') {
      if (role === 'fill') return 'background/surface';
      if (/btn-danger(?!-)/.test(anc)) return 'text/on-danger';
      if (/btn-primary|cb on|\bbadge\b|\bcnt\b/.test(anc)) return 'text/on-accent';
      return role === 'stroke' ? 'background/surface' : 'text/on-accent';
    }
    if (key === '21,24,33,1') return /toast/.test(anc) && role === 'fill' ? 'background/toast' : 'text/primary';
  }
  for (const p of PREF[role]) { const hit = cands.find(n => n.startsWith(p)); if (hit) return hit; }
  return cands[0];
}

// ---------- styles ----------
const usedStyles = new Map();
function tstyle(cs) {
  const fam = /Mono/.test(cs.fontFamily) ? 'Mono' : 'Sans';
  const size = parseFloat(cs.fontSize);
  const lh = cs.lineHeight === 'normal' ? size * 1.2 : parseFloat(cs.lineHeight);
  const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
  const st = styleName(fam, size, cs.fontWeight, lh, ls, cs.textTransform === 'uppercase');
  usedStyles.set(st.name, st);
  return st.name;
}
const SHADOWS = {
  'rgba(20, 24, 40, 0.06) 0px 1px 2px 0px': 'Shadow/Small',
  'rgba(20, 24, 40, 0.14) 0px 10px 30px 0px, rgba(20, 24, 40, 0.06) 0px 2px 6px 0px': 'Shadow/Popover',
  'rgb(231, 237, 254) 0px 0px 0px 3px': 'Focus/Accent',
  'rgb(253, 236, 236) 0px 0px 0px 3px': 'Focus/Danger',
  'rgba(20, 24, 40, 0.08) -12px 0px 32px 0px': 'Shadow/Panel',
  'rgba(20, 24, 40, 0.06) 0px 1px 8px 0px': 'Shadow/Raised',
  'rgba(20, 24, 40, 0.2) 0px 14px 30px 0px, rgba(20, 24, 40, 0.08) 0px 2px 6px 0px': 'Shadow/Drag',
};
const usedNums = { space: new Set(), radius: new Set() };

// ---------- DOM helpers ----------
const has = (el, c) => el && el.cls && el.cls.includes(c);
const kids = el => (el.ch || []);
const elems = el => kids(el).filter(c => c.k === 'e');
const px = v => parseFloat(v) || 0;
function find(el, pred) { if (!el || el.k !== 'e') return null; for (const c of elems(el)) { if (pred(c)) return c; const r = find(c, pred); if (r) return r; } return null; }
function findAll(el, pred, out = []) { for (const c of elems(el)) { if (pred(c)) out.push(c); findAll(c, pred, out); } return out; }
const byCls = (el, c) => find(el, x => has(x, c));
function rawText(el) { if (!el) return ""; if (el.k === 't') return el.s; return kids(el).map(rawText).join(''); }
const clean = s => s.replace(/\s+/g, ' ').trim();
const textOf = el => clean(rawText(el));
function iconName(svgEl) { const n = ICON_BY_SVG[(svgEl.svg || '').replace(/\s+/g, '')]; if (!n) console.warn('unknown icon'); return n || 'more'; }
const firstIcon = el => find(el, c => c.tag === 'svg');
function labColor(el) { return el['data-color'] || 'Blue'; }
function pad(cs) { return [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)]; }
function bw(cs) { return ['Top', 'Right', 'Bottom', 'Left'].map(d => cs['border' + d + 'Style'] === 'none' ? 0 : px(cs['border' + d + 'Width'])); }
function contentBox(el) {
  const p = pad(el.cs), b = bw(el.cs);
  return { x: el.x + p[3] + b[3], y: el.y + p[0] + b[0], w: el.w - p[1] - p[3] - b[1] - b[3], h: el.h - p[0] - p[2] - b[0] - b[2] };
}
function hasBox(el) {
  const cs = el.cs;
  return parseColor(cs.backgroundColor)?.[3] > 0 || cs.backgroundImage !== 'none' || bw(cs).some(x => x > 0) || pad(cs).some(x => x > 0) || cs.boxShadow !== 'none';
}
const isInline = el => el.k === 't' || (el.cs.display === 'inline' && !hasBox(el) && el.tag !== 'svg' && kids(el).every(isInline));
function layoutOf(el) {
  const cs = el.cs, d = cs.display;
  if (/flex/.test(d)) return cs.flexDirection.startsWith('column') ? 'V' : 'H';
  if (/grid/.test(d)) { const cols = cs.gridTemplateColumns === 'none' ? 1 : cs.gridTemplateColumns.split(' ').length; return cols > 1 ? 'G' : 'GV'; }
  return 'B';
}
const near = (a, b, t = 1.5) => Math.abs(a - b) <= t;

// ---------- context ----------
let FR = null; // current frame meta
let HOIST = [];
function anc(P) { let s = ''; for (let p = P; p; p = p.up) s += ' ' + (p.el.cls || []).join(' '); return s; }
const HOIST_CLS = ['menu', 'pop', 'scrim', 'sheet', 'panel', 'toast', 'edge'];
function isHoist(el) { return el.cs.position === 'absolute' && (HOIST_CLS.some(c => has(el, c)) || (has(el, 'tile') && has(el, 'drag'))); }

// ---------- sizing ----------
function sizeFor(el, P, spec, opts = {}) {
  const leaf = opts.leaf;
  const cs = el.cs, pl = P.L;
  const cb = contentBox(P.el);
  const grow = px(cs.flexGrow) > 0;
  let sw = 'H', sh = 'H';
  if (pl === 'H') {
    sw = grow ? 'F' : leaf ? 'X' : 'H';
    const ai = cs.alignSelf === 'auto' ? P.el.cs.alignItems : cs.alignSelf;
    sh = (/stretch|normal/.test(ai) && near(el.h, cb.h) && !leaf && cb.h > 0) ? 'F' : leaf ? 'X' : 'H';
  } else if (pl === 'V') {
    sh = grow ? 'F' : leaf ? 'X' : 'H';
    const ai = cs.alignSelf === 'auto' ? P.el.cs.alignItems : cs.alignSelf;
    sw = (/stretch|normal/.test(ai) && near(el.w, cb.w)) ? 'F' : leaf ? 'X' : 'H';
  } else {
    sw = near(el.w, P.track || cb.w) ? 'F' : leaf ? 'X' : 'H';
    sh = leaf ? 'X' : 'H';
  }
  if (opts.inst && sw === 'H') sw = 'K';
  if (opts.inst && sh === 'H') sh = 'K';
  spec.sw = spec.sw || sw; spec.sh = spec.sh || sh;
  spec.w = +el.w.toFixed(2); spec.h = +el.h.toFixed(2);
  if (el.cs.position === 'absolute' && !opts.noAbs) {
    const pr = P.rect;
    spec.ab = [+(el.x - pr.x).toFixed(2), +(el.y - pr.y).toFixed(2)];
    spec.cn = constraintsFor(el, pr);
    if (spec.sw !== 'F') spec.sw = 'X'; else spec.sw = 'X';
    if (spec.sh !== 'F') spec.sh = 'X'; else spec.sh = 'X';
  }
  return spec;
}
function constraintsFor(el, pr) {
  const L = near(el.x, pr.x), R = near(el.x + el.w, pr.x + pr.w), T = near(el.y, pr.y), B = near(el.y + el.h, pr.y + pr.h);
  const h = L && R ? 'STRETCH' : R && !L ? 'MAX' : near(el.x + el.w / 2, pr.x + pr.w / 2) ? 'CENTER' : 'MIN';
  const v = T && B ? 'STRETCH' : B && !T ? 'MAX' : 'MIN';
  return [h, v];
}

// ---------- text ----------
function segmentsOf(el, base) {
  // returns [text, segs] collapsing whitespace like CSS white-space: normal
  const pre = /pre/.test(el.cs.whiteSpace);
  const parts = [];
  (function walk(n, cs) {
    if (n.k === 't') { parts.push({ s: n.s, cs }); return; }
    if (has(n, 'caret')) { parts.push({ s: '|', cs, caret: true }); return; }
    for (const c of kids(n)) walk(c, n.cs);
  })(el, el.cs);
  let out = '', segs = [];
  for (const p of parts) {
    let s = pre ? p.s : p.s.replace(/\s+/g, ' ');
    if (!pre && out.endsWith(' ') && s.startsWith(' ')) s = s.slice(1);
    if (!pre && out === '' ) s = s.replace(/^ /, '');
    const a = out.length; out += s;
    const st = p.caret ? null : tstyle(p.cs), c = p.caret ? 'accent/default' : tok(p.cs.color, 'text', '');
    segs.push([a, out.length, st, c, /underline/.test(p.cs.textDecorationLine || '')]);
  }
  if (!pre) { const t = out.replace(/ +$/, ''); out = t; }
  if (pre) out = out.replace(/^\n+|\s+$/g, '');
  const baseSt = tstyle(base), baseC = tok(base.color, 'text', '');
  const segOut = [];
  for (const [a, b, st, c, u] of segs) {
    const bb = Math.min(b, out.length); if (bb <= a) continue;
    const o = {};
    if (st && st !== baseSt) o.st = st;
    if (c && JSON.stringify(c) !== JSON.stringify(baseC)) o.c = c;
    if (u) o.u = 1;
    if (Object.keys(o).length) segOut.push([a, bb, o]);
  }
  return [out, segOut];
}
function textSpec(el, P, x, segs, cs, ctxStr) {
  const spec = { t: 'T', x, st: tstyle(cs), c: tok(cs.color, 'text', ctxStr) };
  if (segs && segs.length) spec.seg = segs;
  const lh = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
  const lines = el.lines || (el.k === 'e' && lh ? Math.max(1, Math.round((el.h - px(cs.paddingTop) - px(cs.paddingBottom)) / lh)) : 1);
  const ell = cs.textOverflow === 'ellipsis';
  let sw = 'H';
  if (P.L === 'H') sw = (px(cs.flexGrow) > 0 || ell) ? 'F' : lines > 1 ? (el.k === 'e' ? 'X' : 'F') : 'H';
  else { const cb = contentBox(P.el); sw = (lines > 1 || (el.k === 'e' && near(el.w, cb.w) && !/inline/.test(cs.display))) ? 'F' : 'H'; }
  if (el.k === 'e' && el.cs.display === 'block' && P.L !== 'H') { const cb = contentBox(P.el); if (near(el.w, cb.w)) sw = 'F'; }
  spec.sw = sw; spec.sh = 'H';
  if (ell) spec.tr = 1;
  if (/center/.test(cs.textAlign)) spec.ta = 'CENTER';
  if (/right|end/.test(cs.textAlign) && sw === 'F') spec.ta = 'RIGHT';
  spec.w = +el.w.toFixed(2); spec.h = +el.h.toFixed(2);
  if (px(cs.opacity) < 1 && cs.opacity !== '1') spec.o = +cs.opacity;
  return spec;
}

// ---------- generic frame ----------
const NAMES = { fbody: 'Body', shell: 'Shell', main: 'Main', content: 'Content', board: 'Board', 'board-inner': 'Columns', bgrid: 'Board grid', blist: 'Board list', ltable: 'Label list', auth: 'Auth', 'auth-box': 'Auth box', 'auth-card': 'Auth card', fbar: 'Filter bar', scrim: 'Scrim', 'ph-title': 'Large title', 'pn-b': 'Body', 'pn-f': 'Footer', 'pn-h': 'Header', 'd-labs': 'Labels', 'd-meta': 'Meta', qa: 'Quick add', 'qa-acts': 'Actions', rules: 'Password rules', pal: 'Palette', 'ph-tools': 'Tools', row: 'Row', acts: 'Actions', anchor: 'Anchor', 'pop-h': 'Header', 'pop-list': 'List', 'pop-f': 'Footer', ptr: 'Pull to refresh', 'blist-end': 'List end', sbind: 'Scroll indicator', edge: 'Auto-scroll edge', addcol: 'Add column form', 'br-main': 'Main', 'auth-alt': 'Switch', 'col-empty': 'Empty column', 'dlg-acts': 'Actions', note: 'Note' };
function nameOf(el) { for (const c of el.cls || []) if (NAMES[c]) return NAMES[c]; const c = (el.cls || [])[0]; return c ? c[0].toUpperCase() + c.slice(1) : el.tag === 'div' ? 'Frame' : el.tag; }

function frameVisual(el, spec, ctxStr) {
  const cs = el.cs;
  const bg = tok(cs.backgroundColor, 'fill', ctxStr + ' ' + (el.cls || []).join(' '));
  if (cs.backgroundImage && cs.backgroundImage.startsWith('linear-gradient')) {
    const cols = [...cs.backgroundImage.matchAll(/(rgba?\([^)]+\)|color\([^)]+\))\s*([\d.]+%)?/g)].map(m => [tok(m[1], 'fill', ''), m[2] ? parseFloat(m[2]) / 100 : null]);
    cols.forEach((c, i) => { if (c[1] == null) c[1] = i / Math.max(1, cols.length - 1); });
    cols.forEach((c, i) => { if (c[0] == null) { const n = cols.find(x => x[0] && x[0].raw); c[0] = { raw: n ? [...n[0].raw.slice(0, 3), 0] : [0, 0, 0, 0] }; } });
    spec.f = { g: cols };
  } else if (bg) spec.f = bg;
  const b = bw(cs);
  if (b.some(x => x > 0)) {
    const side = ['Top', 'Right', 'Bottom', 'Left'].find((d, i) => b[i] > 0);
    const sc = tok(cs['border' + side + 'Color'], 'stroke', ctxStr);
    if (sc) {
      spec.s = sc;
      spec.sw2 = b.every(x => x === b[0]) ? b[0] : b;
      const style = cs['border' + side + 'Style'];
      if (style === 'dashed') spec.dash = b[0] >= 1.5 ? [6, 4] : [4, 3];
    }
  }
  const r = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => /%/.test(cs[k]) ? 999 : px(cs[k]));
  if (r.some(x => x > 0)) { spec.r = r.every(x => x === r[0]) ? r[0] : r; r.forEach(x => x && usedNums.radius.add(x >= 999 ? 'full' : x)); }
  if (cs.boxShadow !== 'none') { const e = SHADOWS[cs.boxShadow]; if (e) spec.e = e; else console.warn('unmapped shadow', cs.boxShadow); }
  if (cs.opacity !== '1') spec.o = +cs.opacity;
  if (cs.overflow === 'hidden' || cs.overflow === 'clip') spec.cl = 1;
}

function generic(el, P) {
  const cs = el.cs;
  const L = layoutOf(el);
  const ctxStr = anc(P) + ' ' + (el.cls || []).join(' ');
  // pure inline content -> single text node
  const allInline = kids(el).length > 0 && kids(el).every(isInline) && L === 'B';
  if (allInline && !hasBox(el)) {
    const [x, segs] = segmentsOf(el, cs);
    if (!x) return null;
    return textSpec(el, P, x, segs, cs, ctxStr);
  }
  const spec = { t: 'F', n: nameOf(el) };
  const p = pad(cs), b = bw(cs);
  const pp = [p[0] + b[0], p[1] + b[1], p[2] + b[2], p[3] + b[3]].map(v => +v.toFixed(2));
  if (pp.some(v => v)) { spec.p = pp.every(v => v === pp[0]) ? pp[0] : pp; pp.forEach(v => v && usedNums.space.add(v)); }
  const AL = { 'flex-start': 's', start: 's', normal: 's', center: 'c', 'flex-end': 'e', end: 'e', 'space-between': 'b', stretch: 's', baseline: 'B' };
  if (L === 'H' || L === 'V') {
    spec.L = L;
    const g = px(L === 'H' ? cs.columnGap : cs.rowGap);
    if (g) { spec.g = g; usedNums.space.add(g); }
    spec.A = AL[cs.justifyContent] || 's';
    spec.C = AL[cs.alignItems] || 's';
    if (cs.flexWrap === 'wrap') { spec.wr = 1; const cg = px(L === 'H' ? cs.rowGap : cs.columnGap); if (cg) { spec.cg = cg; usedNums.space.add(cg); } }
  } else if (L === 'G') {
    spec.L = 'G';
    spec.gc = cs.gridTemplateColumns.split(' ').length;
    const rg = px(cs.rowGap), cg = px(cs.columnGap);
    if (rg) { spec.g = rg; usedNums.space.add(rg); }
    if (cg) { spec.cg = cg; usedNums.space.add(cg); }
  } else if (L === 'GV') {
    spec.L = 'V';
    const g = px(cs.rowGap); if (g) { spec.g = g; usedNums.space.add(g); }
    spec.C = cs.justifyItems === 'center' || /center/.test(cs.justifyContent) ? 'c' : 's';
    spec.A = /center/.test(cs.alignContent) || (/center/.test(cs.alignItems) && /normal|stretch/.test(cs.alignContent) && kids(el).filter(c => c.k === 'e' || clean(c.s || '')).length === 1) ? 'c' : 's';
    if (/center/.test(cs.alignItems) && cs.justifyItems === 'center') spec.C = 'c';
  } else {
    spec.L = 'V';
    if (/center/.test(cs.textAlign)) spec.C = 'c';
  }
  frameVisual(el, spec, ctxStr);
  const me = { el, L: spec.L === 'G' ? 'G' : spec.L, up: P, rect: { x: el.x, y: el.y, w: el.w, h: el.h } };
  if (spec.L === 'G') { const cb = contentBox(el); me.track = (cb.w - (spec.gc - 1) * (spec.cg || 0)) / spec.gc; }
  if (L === 'B') me.L = 'V', me.block = true;
  spec.ch = convKids(el, me);
  {
    // A negative top margin pulls an item under the one above it. Figma clamps negative gaps at the frame edge,
    // so the item is placed absolutely at its DOM position and stacking is reversed to keep the earlier item on top.
    for (const c of spec.ch) if (c.mt && !c.ab) { [c.ab, c.w, c.h] = [c.mt.slice(0, 2), c.mt[2], c.mt[3]]; c.sw = 'X'; c.sh = 'X'; spec.rz = 1; }
    for (const c of spec.ch) delete c.mt;
  }
  const leaf = spec.ch.length === 0;
  sizeFor(el, P, spec, { leaf });
  if (spec.ch.length === 1 && !spec.f && !spec.s && !spec.e && !spec.p && !spec.cl && spec.o == null && !spec.ab && !spec.mh) {
    const c = spec.ch[0];
    const fits = c.w == null || c.h == null || (Math.abs(c.w - spec.w) <= 2 && Math.abs(c.h - spec.h) <= 2);
    if (!c.ab && !c.xf && (fits || c.t === 'T')) {
      c.sw = c.t === 'I' && spec.sw === 'H' ? c.sw : spec.sw;
      c.sh = c.t === 'T' ? 'H' : c.t === 'I' && spec.sh === 'H' ? c.sh : spec.sh;
      if (c.t !== 'I' || c.sw !== 'K') c.w = spec.w;
      if (c.t !== 'T' && (c.t !== 'I' || c.sh !== 'K')) c.h = spec.h;
      return c;
    }
  }
  if (cs.minHeight && px(cs.minHeight) > 0 && !leaf) { spec.mh = px(cs.minHeight); }
  return spec;
}

const AUTO_MARGIN = (el, parent) => has(el, 'side-foot') || has(el, 'nk') || (has(el, 'help') && has(parent, 'qa-acts')) || /margin-left:\s*auto/.test(el.style || '');
function convKids(el, me) {
  const out = [];
  let prev = null;
  for (const c of kids(el)) {
    if (c.k === 't') {
      const x = clean(c.s); if (!x) continue;
      if (me.L === 'V' && me.block) { /* stray text in block with block siblings */ }
      const sp = textSpec(c, me, x, null, el.cs, anc(me));
      if (me.L === 'H') sp.sw = c.lines > 1 ? 'F' : 'H';
      out.push(sp); prev = c; continue;
    }
    if (c.cs.display === 'none') continue;
    if (isHoist(c)) { HOIST.push({ el: c, up: me }); continue; }
    if (AUTO_MARGIN(c, el) && out.length) out.push({ t: 'F', n: 'Spacer', sw: me.L === 'H' ? 'F' : 'X', sh: me.L === 'V' ? 'F' : 'X', w: 1, h: 1 });
    const r = conv(c, me);
    if (r == null) continue;
    if (!Array.isArray(r) && me.L === 'V' && px(c.cs.marginTop) < 0) r.mt = [+(c.x - el.x).toFixed(2), +(c.y - el.y).toFixed(2), c.w, c.h];
    {
      const m = (c.cs.transform || '').match(/^matrix\(1, 0, 0, 1, (-?[\d.]+), (-?[\d.]+)\)$/);
      if (m && (+m[1] || +m[2]) && !Array.isArray(r) && !r.ab && !r.xf) r.mt = [+(c.x - el.x).toFixed(2), +(c.y - el.y).toFixed(2), c.w, c.h];
    }
    if (Array.isArray(r)) out.push(...r); else out.push(r);
    prev = c;
  }
  return out;
}

// ---------- component handlers ----------
const phone = () => FR.size === 'phone';
function inst(el, P, k, o, sz = {}) {
  const spec = { t: 'I', k, ...o };
  sizeFor(el, P, spec, { inst: true, ...sz });
  return spec;
}
function iconInst(el, P) {
  const n = iconName(el);
  const spec = { t: 'I', k: 'Icon/' + n, ic: tok(el.cs.color, 'text', anc(P)) };
  sizeFor(el, P, spec, { leaf: true });
  spec.sw = spec.ab ? 'X' : 'X'; spec.sh = 'X';
  return spec;
}
const btnStyle = el => has(el, 'btn-primary') ? 'Primary' : has(el, 'btn-secondary') ? 'Secondary' : has(el, 'btn-danger-ghost') ? 'Danger ghost' : has(el, 'btn-danger') ? 'Danger' : 'Ghost';
function textNoIcons(el) { return clean(kids(el).filter(c => c.k === 't' || (c.tag !== 'svg' && !has(c, 'spin') && !has(c, 'badge') && !has(c, 'cnt') && !has(c, 'caret'))).map(rawText).join('')); }

const H = [];
const on = (pred, fn) => H.push([pred, fn]);
on(el => el.tag === 'svg', (el, P) => iconInst(el, P));
on(el => has(el, 'mark'), (el, P) => inst(el, P, 'Logo', {}));
on(el => has(el, 'brand'), (el, P) => inst(el, P, 'Brand', { v: { Size: /\bside\b/.test(anc(P)) ? 'Sidebar' : /appbar/.test(anc(P)) ? 'App bar' : 'Auth' } }));
on(el => has(el, 'btn'), (el, P) => {
  const ico = firstIcon(el), spin = byCls(el, 'spin');
  const size = phone() ? (has(el, 'sm') ? 'Touch small' : 'Touch') : has(el, 'sm') ? 'Small' : 'Medium';
  const P2 = { Label: textNoIcons(el), 'Show icon': !!ico, Loading: !!spin };
  if (ico) P2.Icon = 'Icon/' + iconName(ico);
  const s = inst(el, P, 'Button', { v: { Style: btnStyle(el), Size: size, State: has(el, 'dis') ? 'Disabled' : 'Default' }, P: P2 });
  if (has(el, 'block')) s.sw = 'F';
  return s;
});
on(el => has(el, 'ib'), (el, P) => {
  const ico = firstIcon(el), badge = byCls(el, 'badge');
  const d = Math.round(el.w);
  const P2 = { Icon: 'Icon/' + (ico ? iconName(ico) : 'more'), 'Show badge': !!badge };
  if (badge) P2.Badge = textOf(badge);
  return inst(el, P, 'Icon button', { v: { Style: has(el, 'boxed') ? 'Boxed' : 'Ghost', State: has(el, 'on') ? 'Selected' : 'Default', Size: d <= 28 ? 'Small' : d >= 40 ? 'Large' : 'Medium' }, P: P2 });
});
on(el => has(el, 'spin'), (el, P) => inst(el, P, 'Spinner', { v: { Size: has(el, 'lg') ? 'Large' : 'Small' }, ov: [{ n: 'Ring', f: tok(el.cs.color, 'text', anc(P)) }] }));
on(el => has(el, 'key'), (el, P) => inst(el, P, 'Key', { P: { Key: textOf(el) } }));
on(el => has(el, 'lab') && has(el, 'chip'), (el, P) => inst(el, P, 'Label chip', { P: { Name: textNoIcons(el), Removable: !!firstIcon(el) }, ov: [{ n: 'Dot', v: { Color: labColor(el) } }] }));
on(el => has(el, 'lab'), (el, P) => {
  const inRow = /\blrow\b/.test(anc(P));
  return inst(el, P, 'Label', { v: { Size: inRow ? (phone() ? 'Large' : 'Medium') : 'Small' }, P: { Name: textOf(el) }, ov: [{ n: 'Dot', v: { Color: labColor(el) } }] });
});
on(el => has(el, 'swc'), (el, P) => inst(el, P, 'Swatch', { P: { Selected: has(el, 'on') }, ov: [{ n: 'Dot', v: { Color: labColor(el) } }] }, { leaf: true }));
on(el => has(el, 'cb'), (el, P) => inst(el, P, 'Checkbox', { v: { Checked: has(el, 'on') ? 'True' : 'False' } }));
const inState = el => has(el, 'dis') ? 'Disabled' : has(el, 'ro') ? 'Read-only' : has(el, 'err') ? 'Error' : has(el, 'focus') ? 'Focus' : 'Default';
on(el => has(el, 'input') && (has(el, 'multi') || has(el, 'area')), (el, P) => {
  const type = has(el, 'title-in') ? 'Title' : has(el, 'area') ? 'Description' : 'Multi-line';
  const span = elems(el).find(c => c.tag !== 'svg') || el;
  const [x] = segmentsOf(span, span.cs);
  const s = inst(el, P, 'Text area', { v: { Type: type, State: inState(el) === 'Error' ? 'Error' : inState(el) === 'Focus' ? 'Focus' : 'Default', Size: phone() ? 'Touch' : 'Default' }, P: { Text: x } });
  if (byCls(el, 'caret')) s.ov = [{ n: 'Text', seg: [[x.length - 1, x.length, { c: 'accent/default' }]] }];
  const tc = tok((byCls(el, 'ph') || span).cs.color, 'text', anc(P));
  if (tc && tc !== 'text/primary') (s.ov = s.ov || []).unshift({ n: 'Text', f: tc });
  return s;
});
on(el => has(el, 'input'), (el, P) => {
  const ch = elems(el);
  const ti = ch.findIndex(c => c.tag !== 'svg');
  const lead = ch.slice(0, Math.max(0, ti)).find(c => c.tag === 'svg');
  const trail = ti >= 0 ? ch.slice(ti + 1).find(c => c.tag === 'svg') : null;
  const ph = byCls(el, 'ph');
  const span = ch[ti];
  const text = ph ? textOf(ph) : span ? textNoIcons(span) : '';
  const P2 = { Text: text, 'Leading icon': !!lead, 'Trailing icon': !!trail, Caret: !!byCls(el, 'caret') };
  if (lead) P2.Leading = 'Icon/' + iconName(lead);
  if (trail) P2.Trailing = 'Icon/' + iconName(trail);
  return inst(el, P, 'Input', { v: { State: inState(el), Size: phone() ? 'Touch' : 'Default', Content: ph ? 'Placeholder' : 'Value' }, P: P2 });
});
on((el, P) => P && has(P.el, 'rules') && el.tag === 'span', (el, P) => inst(el, P, 'Password rule', { v: { Met: has(el, 'ok') ? 'True' : 'False' }, P: { Text: textNoIcons(el) } }));
on(el => has(el, 'errt'), (el, P) => inst(el, P, 'Error message', { P: { Text: textNoIcons(el) } }));
on(el => has(el, 'banner'), (el, P) => inst(el, P, 'Banner', { v: { Type: has(el, 'info') ? 'Info' : 'Error' }, P: { Message: textNoIcons(el) } }));
on(el => has(el, 'toast'), (el, P) => {
  const dot = byCls(el, 'dot');
  return inst(el, P, 'Toast', { v: { Type: dot && /danger/.test(dot.style || '') ? 'Error' : 'Success' }, P: { Message: textNoIcons(el) } });
});
on(el => has(el, 'mi'), (el, P) => {
  const type = has(el, 'hdr') ? 'Header' : has(el, 'hl') ? 'Highlighted' : has(el, 'danger') ? 'Danger' : has(el, 'dis') ? 'Disabled' : 'Default';
  const ico = firstIcon(el);
  const P2 = { Label: textNoIcons(el) };
  if (type !== 'Header') { P2['Show icon'] = !!ico; if (ico) P2.Icon = 'Icon/' + iconName(ico); }
  const s = inst(el, P, 'Menu item', { v: { Type: type, Size: phone() ? 'Touch' : 'Default' }, P: P2 });
  s.sw = 'F';
  return s;
});
on(el => has(el, 'msep'), (el, P) => { const s = inst(el, P, 'Menu divider', {}); s.sw = 'F'; return s; });
on(el => has(el, 'menu'), (el, P) => {
  const me = { el, L: 'V', up: P, rect: el };
  return inst(el, P, 'Menu', { v: { Size: phone() ? 'Touch' : 'Default' }, sl: { Items: convKids(el, me) } });
});
on(el => has(el, 'nav-i'), (el, P) => {
  const ico = firstIcon(el), nk = byCls(el, 'nk');
  const label = textOf({ k: 'e', ch: kids(el).filter(c => !(c.k === 'e' && (has(c, 'nk') || c.tag === 'svg'))) });
  const P2 = { Label: label, 'Show key': !!nk };
  if (nk) P2.Key = textOf(nk);
  if (ico) P2.Icon = 'Icon/' + iconName(ico);
  const s = inst(el, P, 'Nav item', { v: { State: has(el, 'on') ? 'Selected' : has(el, 'dim') ? 'Dim' : 'Default' }, P: P2 });
  s.sw = 'F';
  return s;
});
on(el => has(el, 'av'), (el, P) => inst(el, P, 'Avatar', { P: { Initial: textOf(el) } }));
on(el => has(el, 'sk'), (el, P) => {
  const s = inst(el, P, 'Skeleton', {}, { leaf: true });
  const r = px(el.cs.borderTopLeftRadius), rp = /%/.test(el.cs.borderTopLeftRadius);
  if (rp) s.r = 999; else if (r !== 4) { s.r = r; usedNums.radius.add(r); }
  return s;
});
on(el => has(el, 'opt'), (el, P) => {
  const cb = byCls(el, 'cb'), lab = byCls(el, 'lab');
  const s = inst(el, P, 'Option', { v: { State: has(el, 'hl') ? 'Highlighted' : 'Default', Size: phone() ? 'Touch' : 'Default' }, ov: [{ n: 'Checkbox', v: { Checked: has(cb, 'on') ? 'True' : 'False' } }, { n: 'Label', P: { Name: lab ? textOf(lab) : '' } }, { n: 'Dot', v: { Color: lab ? labColor(lab) : 'Blue' } }] });
  s.sw = 'F';
  return s;
});
on(el => has(el, 'fbtn'), (el, P) => {
  const cnt = byCls(el, 'cnt');
  return inst(el, P, 'Filter button', { v: { State: has(el, 'on') ? 'Active' : 'Default' }, P: { Label: textNoIcons(el), 'Show count': !!cnt, Count: cnt ? textOf(cnt) : '1' } });
});
on(el => has(el, 'drop'), (el, P) => { const s = inst(el, P, 'Drop indicator', {}); s.sw = 'F'; s.sh = 'X'; return s; });
on(el => has(el, 'tile') && (byCls(el, 't-title') || has(el, 'ph')), (el, P) => {
  const state = has(el, 'ph') ? 'Placeholder' : has(el, 'drag') ? 'Dragging' : has(el, 'sel') ? 'Selected' : 'Default';
  const labs = byCls(el, 't-labs');
  const me = { el: labs || el, L: 'H', up: P, rect: labs || el };
  const s = inst(el, P, 'Card', { v: { State: state, Size: phone() ? 'Touch' : 'Default' }, P: { ID: textOf(byCls(el, 't-id') || { k: 'e', ch: [] }), Title: textOf(byCls(el, 't-title') || { k: 'e', ch: [] }), 'Show labels': !!(labs && elems(labs).length) } });
  if (labs && elems(labs).length) s.sl = { Labels: convKids(labs, me) };
  if (state === 'Dragging') {
    const m = (el.cs.transform || '').match(/matrix\(([^)]+)\)/);
    if (m) {
      const [a, b] = m[1].split(',').map(Number);
      const ang = Math.atan2(b, a), cos = Math.cos(ang), sin = Math.sin(ang);
      const W = el.w, Hh = el.h, den = cos * cos - sin * sin;
      const w = (W * cos - Hh * sin) / den, h = (Hh * cos - W * sin) / den;
      const pr = P.rect; const cx = el.x - pr.x + W / 2, cy = el.y - pr.y + Hh / 2;
      const tx = cx - (cos * w / 2 - sin * h / 2), ty = cy - (sin * w / 2 + cos * h / 2);
      s.w = +w.toFixed(2); s.h = +h.toFixed(2); s.xf = [[cos, -sin, tx], [sin, cos, ty]].map(r => r.map(v => +v.toFixed(4)));
      s.sw = 'X'; s.sh = 'K';
    }
  }
  return s;
});
on(el => has(el, 'btile') && byCls(el, 'bt-name'), (el, P) => {
  const meta = elems(byCls(el, 'bt-meta') || { ch: [] });
  const ib = byCls(el, 'ib');
  return inst(el, P, 'Board tile', { v: { State: has(el, 'hov') ? 'Hover' : 'Default' }, P: { Name: textOf(byCls(el, 'bt-name')), Cards: meta[0] ? textOf(meta[0]) : '', Updated: meta[1] ? textOf(meta[1]) : '' }, ov: [{ n: 'Key', P: { Key: textOf(byCls(el, 'key')) } }, ...(ib && has(ib, 'on') ? [{ n: 'Menu button', v: { State: 'Selected' } }] : [])] });
});
on(el => has(el, 'brow') && byCls(el, 'bt-name'), (el, P) => {
  const sub = elems(byCls(el, 'br-sub') || { ch: [] });
  const ib = byCls(el, 'ib');
  const sibs = elems(P.el); const last = sibs[sibs.length - 1] === el;
  return inst(el, P, 'Board row', { P: { Name: textOf(byCls(el, 'bt-name')), Cards: sub[1] ? textOf(sub[1]) : '', Updated: sub[3] ? textOf(sub[3]) : '', 'Show divider': !last }, ov: [{ n: 'Key', P: { Key: sub[0] ? textOf(sub[0]) : '' } }, ...(ib && has(ib, 'on') ? [{ n: 'Menu button', v: { State: 'Selected' } }] : [])] });
});
on(el => has(el, 'add-row'), (el, P) => { const s = inst(el, P, 'Add card button', { v: { Size: phone() ? 'Touch' : 'Default' }, P: { Label: textNoIcons(el) } }); s.sw = 'F'; return s; });
on(el => has(el, 'addcol') && !has(el, 'form'), (el, P) => inst(el, P, 'Add column button', { P: { Label: textNoIcons(el) } }));
// Loading columns have a skeleton header, which the Column component has no slot for.
on(el => has(el, 'col') && !byCls(byCls(el, 'col-h') || { k: 'e', ch: [] }, 'col-name'), (el, P) => generic(el, P));
on(el => has(el, 'col'), (el, P) => {
  const h = byCls(el, 'col-h'), ib = byCls(h, 'ib');
  const body = { ...el, ch: elems(el).filter(c => !has(c, 'col-h') && !has(c, 'add-row')) };
  const me = { el, L: 'V', up: P, rect: el };
  return inst(el, P, 'Column', { v: { Size: phone() ? 'Touch' : 'Default' }, P: { Name: textOf(byCls(h, 'col-name')), Count: textOf(byCls(h, 'col-n') || { k: 'e', ch: [] }), 'Show add card': !!byCls(el, 'add-row') }, ov: ib && has(ib, 'on') ? [{ n: 'Menu button', v: { State: 'Selected' } }] : undefined, sl: { Cards: convKids(body, me) } });
});
on(el => has(el, 'lrow') && byCls(el, 'lab'), (el, P) => {
  const lab = byCls(el, 'lab');
  const sibs = elems(P.el); const last = sibs[sibs.length - 1] === el;
  const s = inst(el, P, 'Label row', { v: { Size: phone() ? 'Touch' : 'Default' }, P: { 'Show divider': !last }, ov: [{ n: 'Label', P: { Name: textOf(lab) } }, { n: 'Dot', v: { Color: labColor(lab) } }] });
  s.sw = 'F';
  return s;
});
on(el => has(el, 'file'), (el, P) => inst(el, P, 'File row', { P: { Name: textOf(elems(el).find(c => c.tag === 'span' && !has(c, 'mono')) || { k: 'e', ch: [] }), Size: textOf(byCls(el, 'mono')) } }));
on(el => has(el, 'drop-zone'), (el, P) => inst(el, P, 'Drop zone', { v: { State: has(el, 'over') ? 'Over' : 'Default' }, P: { Title: textOf(find(el, c => c.tag === 'b')), 'Show hint': !!byCls(el, 'muted') } }));
on(el => has(el, 'state'), (el, P) => {
  const si = byCls(el, 'si'), acts = byCls(el, 'acts');
  const me = { el: acts || el, L: 'H', up: P, rect: acts || el };
  return inst(el, P, 'Empty state', { v: { Type: has(si, 'err') ? 'Error' : 'Default' }, P: { Title: textOf(find(el, c => c.tag === 'h3')), Description: textOf(find(el, c => c.tag === 'p')), Icon: 'Icon/' + iconName(firstIcon(si)) }, sl: acts ? { Actions: convKids(acts, me) } : undefined });
});
on(el => has(el, 'field'), (el, P) => {
  const lab = elems(el).find(c => c.tag === 'label');
  const body = { ...el, ch: kids(el).filter(c => c !== lab) };
  const me = { el, L: 'V', up: P, rect: el };
  return inst(el, P, 'Field', { v: { Size: phone() ? 'Touch' : 'Default' }, P: { Label: lab ? textOf(lab) : '', 'Show label': !!lab }, sl: { Control: convKids(body, me) } });
});
on(el => has(el, 'dlg'), (el, P) => {
  const ch = elems(el);
  const h2 = ch.find(c => c.tag === 'h2');
  const i = ch.indexOf(h2);
  const desc = ch[i + 1] && ch[i + 1].tag === 'p' && !ch[i + 1].style ? ch[i + 1] : null;
  const acts = ch.find(c => has(c, 'dlg-acts'));
  const prog = has(el, 'center');
  const me = { el, L: 'V', up: P, rect: el };
  const content = { ...el, ch: kids(el).filter(c => c !== h2 && c !== desc && c !== acts && !(prog && c.k === 'e' && has(c, 'spin'))) };
  const s = inst(el, P, 'Dialog', { v: { Type: prog ? 'Progress' : 'Default', Size: phone() ? 'Touch' : 'Default' }, P: { Title: textOf(h2), Description: desc ? textOf(desc) : '', 'Show description': !!desc } });
  if (!prog) s.sl = { Content: convKids(content, me), Actions: acts ? convKids(acts, { el: acts, L: 'H', up: me, rect: acts }) : [] };
  return s;
});
on(el => has(el, 'sheet'), (el, P) => {
  const me = { el, L: 'V', up: P, rect: el };
  return inst(el, P, 'Bottom sheet', { sl: { Content: convKids({ ...el, ch: kids(el).filter(c => !(c.k === 'e' && has(c, 'grab'))) }, me) } });
});
on(el => has(el, 'pop'), (el, P) => inst(el, P, 'Popover', { sl: { Content: convKids(el, { el, L: 'V', up: P, rect: el }) } }));
on(el => has(el, 'panel'), (el, P) => {
  const h = byCls(el, 'pn-h'), b = byCls(el, 'pn-b'), f = byCls(el, 'pn-f');
  const hs = elems(h);
  return inst(el, P, 'Panel', { P: { 'Card ID': textOf(hs[0]), Column: textOf(hs[1]) }, sl: { Body: convKids(b, { el: b, L: 'V', up: P, rect: b }), Footer: convKids(f, { el: f, L: 'H', up: P, rect: f }) } });
});
on(el => has(el, 'side'), (el, P) => {
  const navs = elems(el).filter(c => has(c, 'nav'));
  const main = elems(navs[0]), boards = elems(navs[1] || { ch: [] });
  const items = boards.filter(c => has(c, 'nav-i') && !has(c, 'dim'));
  const me = { el: navs[1] || el, L: 'V', up: P, rect: navs[1] || el };
  const ov = [];
  const st = c => has(c, 'on') ? 'Selected' : 'Default';
  if (main[0]) ov.push({ n: 'All boards', v: { State: st(main[0]) } });
  if (main[1]) ov.push({ n: 'Labels', v: { State: st(main[1]) } });
  const email = byCls(el, 'acct');
  return inst(el, P, 'Sidebar', { P: { Email: textOf(byCls(email, 'ell')) }, ov, sl: { Boards: items.map(c => conv(c, me)) } });
});
on(el => has(el, 'hdr') && !has(el, 'mi'), (el, P) => {
  const ch = kids(el);
  const spIdx = ch.findIndex(c => c.k === 'e' && has(c, 'sp'));
  const key = byCls(el, 'key'), meta = elems(el).find(c => has(c, 'meta'));
  const me = { el, L: 'H', up: P, rect: el };
  const acts = spIdx >= 0 ? ch.slice(spIdx + 1) : [];
  return inst(el, P, 'Page header', { P: { Title: textOf(find(el, c => c.tag === 'h1')), 'Show key': !!key, 'Show meta': !!meta, Meta: meta ? textOf(meta) : '' }, ov: key ? [{ n: 'Key', P: { Key: textOf(key) } }] : undefined, sl: { Actions: convKids({ ...el, ch: acts }, me) } });
});
on(el => has(el, 'appbar'), (el, P) => {
  const ch = elems(el);
  const brand = ch.find(c => has(c, 'brand')), title = ch.find(c => has(c, 'ab-title')), center = ch.find(c => has(c, 'ab-center'));
  const type = brand ? 'Brand' : center ? 'Centered' : 'Title';
  const me = { el, L: 'H', up: P, rect: el };
  const pivot = brand ? ch.findIndex(c => has(c, 'sp')) : ch.indexOf(title || center);
  const lead = brand ? [] : ch.slice(0, pivot);
  const trail = ch.slice(pivot + 1);
  const P2 = {};
  if (title) { const b = find(title, c => c.tag === 'b'), sub = elems(title).find(c => c.tag === 'span'); P2.Title = textOf(b); P2.Subtitle = sub ? textOf(sub) : ''; P2['Show subtitle'] = !!sub; }
  if (center) P2.Title = textOf(center);
  const sl = { Actions: convKids({ ...el, ch: trail }, me) };
  if (!brand) sl.Leading = convKids({ ...el, ch: lead }, me);
  return inst(el, P, 'App bar', { v: { Type: type, Raised: has(el, 'raised') ? 'True' : 'False' }, P: P2, sl });
});
on(el => has(el, 'sp') && !kids(el).length, (el, P) => ({ t: 'F', n: 'Spacer', sw: P.L === 'H' ? 'F' : 'X', sh: P.L === 'V' ? 'F' : 'X', w: 1, h: 1 }));
on(el => has(el, 'anchor'), (el, P) => {
  const inner = kids(el).filter(c => !(c.k === 'e' && isHoist(c)));
  for (const c of kids(el)) if (c.k === 'e' && isHoist(c)) HOIST.push({ el: c, up: P });
  if (inner.length === 1 && inner[0].k === 'e') return conv(inner[0], P);
  return generic({ ...el, ch: inner }, P);
});

function conv(el, P) {
  if (el.k === 't') return null;
  if (el.cs.visibility === 'hidden') return null;
  for (const [pred, fn] of H) if (pred(el, P)) return fn(el, P);
  return generic(el, P);
}

function compileFrame(f) {
  FR = f; HOIST = [];
  const root = f.root;
  const rootP = { el: { ...root, x: 0, y: 0 }, L: 'V', rect: { x: 0, y: 0, w: f.w, h: f.h } };
  const spec = { t: 'F', n: f.title, L: 'V', sw: 'X', sh: 'X', w: f.w, h: f.h, f: 'background/app', cl: 1 };
  spec.ch = convKids(root, rootP);
  // Component handlers that turn a subtree into an instance never visit nested overlays, so collect the ones left over.
  (function sweep(el, inHoist) {
    for (const c of kids(el)) {
      if (c.k !== 'e' || c.cs.display === 'none') continue;
      const h = isHoist(c);
      if (h && !inHoist && !HOIST.some(x => x.el === c)) HOIST.push({ el: c, up: rootP });
      sweep(c, inHoist || h);
    }
  })(root, false);
  const hoisted = [];
  for (let i = 0; i < HOIST.length; i++) {
    const { el } = HOIST[i];
    const P = { el: rootP.el, L: 'V', rect: rootP.rect, up: null };
    const s = conv(el, P);
    if (!s) continue;
    if (!s.ab) { s.ab = [+el.x.toFixed(2), +el.y.toFixed(2)]; s.cn = constraintsFor(el, rootP.rect); }
    if (s.xf) delete s.ab;
    if (s.xf) s.abx = 1;
    if (s.sw === 'F' || s.sw === 'K' || s.sw === 'H') s.sw = s.t === 'I' ? 'K' : 'X';
    hoisted.push(s);
  }
  for (const s of hoisted) { if (s.xf) s.ab = [0, 0]; }
  spec.ch.push(...hoisted);
  return spec;
}

module.exports = { compileFrame, usedStyles, usedNums, unmapped: () => unmapped, tstyle };

if (require.main === module) {
  const P = ['auth', 'board-list', 'board-view', 'card-detail', 'labels', 'import-export'];
  const out = {};
  for (const p of P) {
    const frames = JSON.parse(fs.readFileSync('raw/' + p + '.json'));
    out[p] = frames.map(f => {
      const sizeLabel = f.size === 'phone' ? 'Phone 390' : f.size === 'tablet' ? 'Tablet 834' : 'Desktop 1440';
      f.title = `${f.stateLabel || f.state} · ${sizeLabel}`;
      return { meta: { idx: f.idx, note: f.note, size: f.size, state: f.state, group: f.group, title: f.title }, spec: compileFrame(f) };
    });
    const sz = JSON.stringify(out[p]).length;
    console.log(p, out[p].length, (sz / 1024).toFixed(0) + 'KB');
  }
  fs.writeFileSync('screens.json', JSON.stringify(out));
  console.log('styles', usedStyles.size, 'space', [...usedNums.space].sort((a, b) => a - b).join(','), 'radius', [...usedNums.radius].join(','));
  console.log('unmapped', unmapped);
}
