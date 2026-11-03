// Figma-side runtime. Evaluated with new Function('figma', code) and returns the API object.
const V = {}, TS = {}, ES = {}, CM = {}, DEFS = new Map();
const log = [];
const FONTS = { Sans: 'Geist', Mono: 'Geist Mono' };
const WN = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

async function init(reg) {
  const vars = await figma.variables.getLocalVariablesAsync();
  for (const v of vars) V[v.name] = v;
  for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
  for (const s of await figma.getLocalEffectStylesAsync()) ES[s.name] = s;
  const fams = ['Geist', 'Geist Mono'];
  await Promise.all(fams.flatMap(f => ['Regular', 'Medium', 'SemiBold', 'Bold'].map(st => figma.loadFontAsync({ family: f, style: st }))));
  if (reg) {
    const ids = Object.entries(reg);
    const nodes = await Promise.all(ids.map(([, id]) => figma.getNodeByIdAsync(id)));
    ids.forEach(([n], i) => { if (nodes[i]) CM[n] = nodes[i]; });
  }
}

function solid(tok, op) {
  if (typeof tok === 'object' && tok.raw) {
    const [r, g, b, a] = tok.raw;
    return { type: 'SOLID', color: { r: r / 255, g: g / 255, b: b / 255 }, opacity: (a == null ? 1 : a) * (op == null ? 1 : op) };
  }
  const v = V[tok];
  if (!v) { log.push('missing var ' + tok); return { type: 'SOLID', color: { r: 1, g: 0, b: 1 } }; }
  const p = { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: op == null ? 1 : op };
  return figma.variables.setBoundVariableForPaint(p, 'color', v);
}
function paint(f) {
  if (f == null) return [];
  if (Array.isArray(f)) return f.flatMap(paint);
  if (typeof f === 'object' && f.g) {
    const stops = f.g.map(([tok, pos]) => {
      const st = { position: pos, color: { r: 0, g: 0, b: 0, a: 1 } };
      if (tok == null) { st.color.a = 0; return st; }
      if (typeof tok === 'object' && tok.raw) { const [r, g, b, a] = tok.raw; st.color = { r: r / 255, g: g / 255, b: b / 255, a: a == null ? 1 : a }; return st; }
      const v = V[tok]; if (v) st.boundVariables = { color: { type: 'VARIABLE_ALIAS', id: v.id } };
      return st;
    });
    return [{ type: 'GRADIENT_LINEAR', gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: stops }];
  }
  if (typeof f === 'object' && f.t) return [solid(f.t, f.o)];
  return [solid(f)];
}
function fmt(n) { return String(Math.round(n * 100) / 100); }
function bindNum(node, field, val, prefix) {
  if (val == null) return;
  node[field] = val;
  const v = V[prefix + '/' + (val >= 999 ? 'full' : fmt(val))];
  if (v) try { node.setBoundVariable(field, v); } catch (e) { log.push('bind ' + field + ' ' + e.message); }
}
const ALIGN = { s: 'MIN', c: 'CENTER', e: 'MAX', b: 'SPACE_BETWEEN', B: 'BASELINE' };

function frameProps(n, s) {
  if (s.n) n.name = s.n;
  n.fills = paint(s.f);
  if (s.L) {
    n.layoutMode = s.L === 'H' ? 'HORIZONTAL' : s.L === 'V' ? 'VERTICAL' : 'GRID';
    if (s.L === 'G') {
      n.gridColumnCount = s.gc || 1;
      if (s.g != null) bindNum(n, 'gridRowGap', s.g, 'space');
      if (s.cg != null) bindNum(n, 'gridColumnGap', s.cg, 'space');
    } else {
      n.primaryAxisSizingMode = 'AUTO'; n.counterAxisSizingMode = 'AUTO';
      if (s.g < 0) n.itemSpacing = s.g; else if (s.g) bindNum(n, 'itemSpacing', s.g, 'space');
      if (s.rz) n.itemReverseZIndex = true;
      if (s.A) n.primaryAxisAlignItems = ALIGN[s.A];
      if (s.C) n.counterAxisAlignItems = ALIGN[s.C];
      if (s.wr) { n.layoutWrap = 'WRAP'; if (s.cg) bindNum(n, 'counterAxisSpacing', s.cg, 'space'); }
    }
    const p = s.p == null ? [0, 0, 0, 0] : typeof s.p === 'number' ? [s.p, s.p, s.p, s.p] : s.p;
    ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach((k, i) => { if (p[i]) bindNum(n, k, p[i], 'space'); });
    if (s.mw) n.minWidth = s.mw;
    if (s.mh) n.minHeight = s.mh;
    if (s.xw) n.maxWidth = s.xw;
  }
  if (s.s) {
    n.strokes = paint(s.s);
    const w = s.sw2 == null ? 1 : s.sw2;
    if (typeof w === 'number') n.strokeWeight = w;
    else { n.strokeTopWeight = w[0]; n.strokeRightWeight = w[1]; n.strokeBottomWeight = w[2]; n.strokeLeftWeight = w[3]; }
    n.strokeAlign = s.sa || 'INSIDE';
    if (s.dash) n.dashPattern = s.dash;
  }
  if (s.r != null) {
    if (typeof s.r === 'number') { bindNum(n, 'topLeftRadius', s.r, 'radius'); bindNum(n, 'topRightRadius', s.r, 'radius'); bindNum(n, 'bottomLeftRadius', s.r, 'radius'); bindNum(n, 'bottomRightRadius', s.r, 'radius'); }
    else { bindNum(n, 'topLeftRadius', s.r[0], 'radius'); bindNum(n, 'topRightRadius', s.r[1], 'radius'); bindNum(n, 'bottomRightRadius', s.r[2], 'radius'); bindNum(n, 'bottomLeftRadius', s.r[3], 'radius'); }
  }
  if (s.o != null) n.opacity = s.o;
  if ('cl' in s || n.type !== 'INSTANCE') n.clipsContent = !!s.cl;
}

async function applyEffect(n, s) {
  if (s.e) { const st = ES[s.e]; if (st) await n.setEffectStyleIdAsync(st.id); else log.push('missing effect ' + s.e); }
  // Figma ignores shadow spread on frames that don't clip content (focus rings disappear).
  if (n.type !== 'INSTANCE' && n.effects.some(e => e.type === 'DROP_SHADOW' && e.spread > 0)) n.clipsContent = true;
}

function sizing(n, s, parent) {
  const auto = parent && (parent.layoutMode === 'HORIZONTAL' || parent.layoutMode === 'VERTICAL' || parent.layoutMode === 'GRID');
  if (s.ab && auto) {
    n.layoutPositioning = 'ABSOLUTE';
  }
  const fw = s.sw === 'X' || (!auto && s.w != null) || (s.ab && s.w != null && s.sw !== 'H');
  const fh = s.sh === 'X' || (!auto && s.h != null) || (s.ab && s.h != null && s.sh !== 'H');
  if ((fw || fh) && 'resize' in n) {
    try { n.resize(fw ? Math.max(0.01, s.w) : n.width, fh ? Math.max(0.01, s.h) : n.height); } catch (e) { log.push('resize ' + e.message); }
  }
  const hasAL = n.layoutMode && n.layoutMode !== 'NONE';
  // Instances already inherit the main's sizing; forcing HUG collapses fixed-size mains (32px Icon button → 16px).
  const canHug = (hasAL && n.type !== 'INSTANCE') || n.type === 'TEXT';
  const map = (v, fixed) => v === 'F' ? 'FILL' : v === 'H' ? (canHug ? 'HUG' : null) : v === 'K' ? null : fixed ? 'FIXED' : null;
  if (auto && !s.ab) {
    let h = map(s.sw, fw), v = map(s.sh, fh);
    // Figma never wraps FILL children; a fixed DOM width reproduces how the browser wrapped them.
    if (h === 'FILL' && parent.layoutWrap === 'WRAP' && s.w != null && s.n !== 'Spacer') { try { n.resize(s.w, n.height); } catch (e) { } h = 'FIXED'; }
    // FILL inside a hugging slot collapses or pushes siblings out; children keep their own size instead.
    // Only slots: other parents are still unsized here, their sizing is applied after their children.
    if (parent.type === 'SLOT') {
      const hugW = parent.layoutMode === 'HORIZONTAL' ? parent.primaryAxisSizingMode === 'AUTO' : parent.counterAxisSizingMode === 'AUTO';
      const hugH = parent.layoutMode === 'VERTICAL' ? parent.primaryAxisSizingMode === 'AUTO' : parent.counterAxisSizingMode === 'AUTO';
      if (h === 'FILL' && hugW && parent.layoutMode !== 'GRID') h = null;
      if (v === 'FILL' && hugH && parent.layoutMode !== 'GRID') v = null;
    }
    try { if (h) n.layoutSizingHorizontal = h; } catch (e) { log.push('sizeH ' + (s.n || s.k) + ' ' + e.message); }
    try { if (v) n.layoutSizingVertical = v; } catch (e) { log.push('sizeV ' + (s.n || s.k) + ' ' + e.message); }
  } else if (hasAL) {
    if (s.sw === 'H' && canHug) n.layoutSizingHorizontal = 'HUG';
    if (s.sh === 'H' && canHug) n.layoutSizingVertical = 'HUG';
  }
  if (s.ab) {
    n.x = s.ab[0]; n.y = s.ab[1];
    if (s.cn) n.constraints = { horizontal: s.cn[0], vertical: s.cn[1] };
  }
  if (s.xf) { try { n.relativeTransform = s.xf; } catch (e) { log.push('xf ' + e.message); } }
  if (s.hv && V[s.hv]) try { n.setBoundVariable('height', V[s.hv]); } catch (e) { log.push('hv ' + e.message); }
  if (s.wv && V[s.wv]) try { n.setBoundVariable('width', V[s.wv]); } catch (e) { log.push('wv ' + e.message); }
  if (s.rot) n.rotation = s.rot;
}

function textStyle(name) { const st = TS[name]; if (!st) log.push('missing text style ' + name); return st; }

async function makeText(s, parent, refs) {
  const t = figma.createText();
  const st = textStyle(s.st);
  if (st) { t.fontName = st.fontName; await t.setTextStyleIdAsync(st.id); }
  t.characters = s.x || '';
  t.fills = paint(s.c || 'text/primary');
  if (s.n) t.name = s.n; else t.name = (s.x || '').slice(0, 40);
  if (s.ta) t.textAlignHorizontal = s.ta;
  if (s.seg) for (const [a, b, o] of s.seg) {
    if (b <= a) continue;
    if (o.st) { const ss = textStyle(o.st); if (ss) await t.setRangeTextStyleIdAsync(a, b, ss.id); }
    if (o.c) t.setRangeFills(a, b, paint(o.c));
    if (o.u) t.setRangeTextDecoration(a, b, 'UNDERLINE');
  }
  parent.appendChild(t);
  if (s.sw === 'F' || s.sw === 'X') t.textAutoResize = 'HEIGHT'; else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  sizing(t, s, parent);
  if (s.sw === 'F' || s.sw === 'X') t.textAutoResize = 'HEIGHT';
  if (s.xw) t.maxWidth = s.xw;
  if (s.tr) { t.textTruncation = 'ENDING'; t.maxLines = 1; }
  if (s.o != null) t.opacity = s.o;
  if (refs && s.pt) refs.push({ node: t, kind: 'characters', prop: s.pt });
  if (refs && s.pv) refs.push({ node: t, kind: 'visible', prop: s.pv });
  return t;
}

function propKey(owner, name) {
  let d = DEFS.get(owner.id);
  if (!d) { d = owner.componentPropertyDefinitions; DEFS.set(owner.id, d); }
  return Object.keys(d).find(k => k.split('#')[0] === name);
}
function ownerOf(comp) { return comp.parent && comp.parent.type === 'COMPONENT_SET' ? comp.parent : comp; }
function pickVariant(set, v) {
  if (set.type !== 'COMPONENT_SET') return set;
  const kids = set.children;
  if (!v) return set.defaultVariant || kids[0];
  const hit = kids.find(c => { const vp = c.variantProperties || {}; return Object.entries(v).every(([k, val]) => vp[k] === val); });
  if (!hit) log.push('no variant ' + set.name + ' ' + JSON.stringify(v));
  return hit || set.defaultVariant || kids[0];
}
function setProps(inst, P) {
  if (!P) return;
  const comp = inst.mainComponent; if (!comp) return;
  const owner = ownerOf(comp);
  const out = {};
  for (const [n, val] of Object.entries(P)) {
    const key = propKey(owner, n);
    if (!key) { log.push('no prop ' + owner.name + '.' + n); continue; }
    const def = DEFS.get(owner.id)[key];
    if (def.type === 'INSTANCE_SWAP') { const c = CM[val]; if (!c) { log.push('no swap ' + val); continue; } out[key] = c.id; }
    else out[key] = val;
  }
  const swaps = Object.keys(out).some(k => DEFS.get(owner.id)[k].type === 'INSTANCE_SWAP');
  const icons = () => inst.findAll(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.name.startsWith('Icon/'));
  // Swapping an icon resets its stroke overrides, so the variant's icon color has to be put back.
  const before = swaps ? icons().map(n => { const v = n.findOne(x => 'strokes' in x && x.strokes.length); return v ? v.strokes : null; }) : [];
  try { inst.setProperties(out); } catch (e) { log.push('setProps ' + owner.name + ' ' + e.message); }
  if (swaps) icons().forEach((n, i) => { if (before[i]) for (const v of n.findAll(x => 'strokes' in x && x.strokes.length)) v.strokes = before[i]; });
}
function recolorIcon(node, tok) {
  const vs = node.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE'] });
  for (const v of vs) { if (v.strokes && v.strokes.length) v.strokes = paint(tok); }
}

async function makeInstance(s, parent, refs) {
  const c = CM[s.k];
  if (!c) { log.push('no component ' + s.k); const f = figma.createFrame(); f.name = 'MISSING ' + s.k; parent.appendChild(f); return f; }
  const comp = pickVariant(c, s.v);
  const i = comp.createInstance();
  parent.appendChild(i);
  if (s.n) i.name = s.n;
  setProps(i, s.P);
  if (s.ov) for (const o of s.ov) {
    const tgt = i.findOne(n => n.name === o.n && (o.t ? n.type === o.t : true));
    if (!tgt) { log.push('no nested ' + o.n + ' in ' + s.k); continue; }
    if (o.v || o.P) {
      if (o.v && tgt.type === 'INSTANCE') {
        const nm = tgt.mainComponent; const set = nm && nm.parent && nm.parent.type === 'COMPONENT_SET' ? nm.parent : null;
        if (set) { const nv = pickVariant(set, Object.assign({}, nm.variantProperties, o.v)); if (nv !== nm) tgt.swapComponent(nv); }
      }
      if (o.P) setProps(tgt, o.P);
    }
    if (o.x != null && tgt.type === 'TEXT') tgt.characters = o.x;
    if (o.vis != null) tgt.visible = o.vis;
    if (o.ic) recolorIcon(tgt, o.ic);
    if (o.f) tgt.fills = paint(o.f);
    if (o.seg && tgt.type === 'TEXT') for (const [a, b, so] of o.seg) { if (so.c) tgt.setRangeFills(a, b, paint(so.c)); if (so.st) { const ss = textStyle(so.st); if (ss) await tgt.setRangeTextStyleIdAsync(a, b, ss.id); } }
  }
  if (s.ic) recolorIcon(i, s.ic);
  if (s.r != null) { for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) bindNum(i, f, s.r, 'radius'); }
  const own = i.findAllWithCriteria({ types: ['SLOT'] }).filter(x => { let p = x.parent; while (p && p.type !== 'INSTANCE') p = p.parent; return p === i; });
  for (const slot of own) for (const k of [...slot.children]) k.remove();
  if (s.sl) for (const [name, kids] of Object.entries(s.sl)) {
    const slot = own.find(x => x.name === name);
    if (!slot) { log.push('no slot ' + name + ' in ' + s.k); continue; }
    for (const k of kids) await build(k, slot, null);
  }
  for (const slot of own) if (!slot.children.length && !(slot.componentPropertyReferences || {}).visible) slot.visible = false;
  if (s.o != null) i.opacity = s.o;
  sizing(i, s, parent);
  if (refs && s.pi) refs.push({ node: i, kind: 'mainComponent', prop: s.pi });
  if (refs && s.pv) refs.push({ node: i, kind: 'visible', prop: s.pv });
  if (refs && s.ex) refs.push({ node: i, kind: 'expose' });
  return i;
}

async function build(s, parent, refs, mk) {
  if (s.t === 'T') return makeText(s, parent, refs);
  if (s.t === 'I') return makeInstance(s, parent, refs);
  let n;
  if (mk) n = mk();
  else if (s.t === 'E') n = figma.createEllipse();
  else if (s.t === 'SVG') { n = figma.createNodeFromSvg(s.svg); }
  else n = figma.createFrame();
  if (s.t === 'E') { if (s.cn && !s.ab) n.constraints = { horizontal: s.cn[0], vertical: s.cn[1] }; n.fills = paint(s.f); if (s.s) { n.strokes = paint(s.s); n.strokeWeight = s.sw2 || 1; n.strokeAlign = s.sa || 'INSIDE'; } if (s.arc) n.arcData = s.arc; if (s.n) n.name = s.n; if (s.o != null) n.opacity = s.o; }
  else if (s.t !== 'SVG') frameProps(n, s);
  else if (s.n) n.name = s.n;
  if (parent && !mk) parent.appendChild(n);
  if (s.t !== 'E' && s.t !== 'SVG') await applyEffect(n, s);
  const made = [];
  if (s.ch) for (const c of s.ch) made.push([c, await build(c, n, refs)]);
  if (parent || mk) sizing(n, s, mk ? null : parent);
  for (const [c, k] of made) {
    if (!k || (!c.ab && n.layoutMode !== 'NONE')) continue;
    if (c.fitB) { k.resize(n.width, k.height); k.x = 0; k.y = n.height - k.height; continue; }
    if (c.xf) { try { k.relativeTransform = c.xf; } catch (e) { } continue; }
    if (c.w != null && c.h != null && 'resize' in k && k.type !== 'TEXT') {
      const w = c.sw === 'K' || c.sw === 'H' ? k.width : c.w, h = c.sh === 'K' || c.sh === 'H' ? k.height : c.h;
      if (Math.abs(w - k.width) > 0.5 || Math.abs(h - k.height) > 0.5) { try { k.resize(w, h); } catch (e) { } }
    }
    // Shrinking the parent can stretch a STRETCH child to a negative size, which leaves it flipped after resize().
    if (c.ab) { try { k.relativeTransform = [[1, 0, c.ab[0]], [0, 1, c.ab[1]]]; } catch (e) { k.x = c.ab[0]; k.y = c.ab[1]; } }
  }
  if (refs && s.pv) refs.push({ node: n, kind: 'visible', prop: s.pv });
  if (refs && s.slot) refs.push({ node: n, kind: 'slot', prop: s.slot });
  if (s.desc && 'description' in n) n.description = s.desc;
  return n;
}

// Post-pass: hugging frames that came out a different size than the source get the source size.
function fixSizes(node, s, stats) {
  if (!s || !node) return;
  if (s.ch && 'children' in node && node.type !== 'INSTANCE') {
    const kids = node.children;
    for (let i = 0; i < s.ch.length && i < kids.length; i++) fixSizes(kids[i], s.ch[i], stats);
  }
  if (s.sl && node.type === 'INSTANCE') {
    const slots = node.findAllWithCriteria({ types: ['SLOT'] });
    for (const [name, kids] of Object.entries(s.sl)) {
      const slot = slots.find(x => x.name === name); if (!slot) continue;
      for (let i = 0; i < kids.length && i < slot.children.length; i++) fixSizes(slot.children[i], kids[i], stats);
    }
  }
  if (s.t === 'T' || s.ab) return;
  const p = node.parent; const auto = p && p.layoutMode && p.layoutMode !== 'NONE';
  if (!auto) return;
  const hw = s.sw === 'H' || s.sw === 'K', hh = s.sh === 'H' || s.sh === 'K';
  if (hw && s.w != null && Math.abs(node.width - s.w) > 1.5) { try { node.layoutSizingHorizontal = 'FIXED'; node.resize(s.w, node.height); stats.w++; stats.list.push((s.n || s.k) + ' w ' + Math.round(node.width) + '->' + s.w); } catch (e) { } }
  if (hh && s.h != null && Math.abs(node.height - s.h) > 1.5) { try { node.layoutSizingVertical = 'FIXED'; node.resize(node.width, s.h); stats.h++; stats.list.push((s.n || s.k) + ' h ' + Math.round(node.height) + '->' + s.h); } catch (e) { } }
}

async function buildSet(def, page, at) {
  // def: {set, desc, variants:[{v, root}], props:[{n,t,d}], layout:{cols}}
  const comps = [], allRefs = [];
  for (const vr of def.variants || [{ v: null, root: def.root }]) {
    const refs = [];
    const c = await build(vr.root, null, refs, () => figma.createComponent());
    page.appendChild(c);
    c.name = vr.v ? Object.entries(vr.v).map(([k, v]) => k + '=' + v).join(', ') : def.set;
    comps.push(c); allRefs.push(refs);
  }
  let owner;
  if (def.variants) {
    owner = figma.combineAsVariants(comps, page);
    owner.name = def.set;
    owner.layoutMode = 'HORIZONTAL'; owner.layoutWrap = 'WRAP';
    owner.itemSpacing = 16; owner.counterAxisSpacing = 16;
    owner.paddingTop = owner.paddingBottom = owner.paddingLeft = owner.paddingRight = 16;
    owner.primaryAxisSizingMode = 'FIXED'; owner.counterAxisSizingMode = 'AUTO';
    owner.resize(def.setW || 900, owner.height);
    owner.fills = paint('background/app');
    owner.strokes = paint('border/default'); owner.dashPattern = [4, 4]; owner.cornerRadius = 8;
  } else owner = comps[0];
  if (def.desc) owner.description = def.desc;
  if (def.icon) {
    const svg = owner.children[0];
    for (const v of svg.findAllWithCriteria({ types: ['VECTOR'] })) { owner.appendChild(v); v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; }
    svg.remove();
    recolorIcon(owner, 'text/muted');
  }
  const keys = {};
  for (const p of def.props || []) {
    if (p.t === 'SLOT') continue;
    let d = p.d;
    if (p.t === 'INSTANCE_SWAP') d = CM[p.d].id;
    const opts = p.t === 'INSTANCE_SWAP' && p.pref ? { preferredValues: p.pref.map(n => ({ type: 'COMPONENT', key: CM[n].key })) } : undefined;
    keys[p.n] = owner.addComponentProperty(p.n, p.t, d, opts);
  }
  const slotKeys = {};
  for (let ci = 0; ci < comps.length; ci++) {
    for (const r of allRefs[ci]) {
      if (r.kind === 'expose') { try { r.node.isExposedInstance = true; } catch (e) { log.push('expose ' + e.message); } continue; }
      if (r.kind === 'slot') {
        if (!def.variants) {
          const slot = comps[ci].createSlot();
          slot.name = r.prop;
          const f = r.node; const par = f.parent; const idx = par.children.indexOf(f);
          par.insertChild(idx, slot);
          copyLayout(f, slot);
          const vis = (f.componentPropertyReferences || {}).visible;
          if (vis) slot.componentPropertyReferences = Object.assign({}, slot.componentPropertyReferences, { visible: vis });
          f.remove();
        } else {
          if (!slotKeys[r.prop]) slotKeys[r.prop] = owner.addComponentProperty(r.prop, 'SLOT', '');
          try { r.node.componentPropertyReferences = Object.assign({}, r.node.componentPropertyReferences, { slotContentId: slotKeys[r.prop] }); } catch (e) { log.push('slotref ' + e.message); }
        }
        continue;
      }
      const key = keys[r.prop];
      if (!key) { log.push('no key ' + r.prop); continue; }
      const refs = Object.assign({}, r.node.componentPropertyReferences || {});
      refs[r.kind] = key;
      try { r.node.componentPropertyReferences = refs; } catch (e) { log.push('ref ' + r.prop + ' ' + e.message); }
      if (r.kind === 'visible') { const p = (def.props || []).find(x => x.n === r.prop); if (p) r.node.visible = !!p.d; }
    }
  }
  if (at) { owner.x = at[0]; owner.y = at[1]; }
  return owner;
}
function copyLayout(f, s) {
  s.layoutMode = f.layoutMode === 'GRID' ? 'VERTICAL' : f.layoutMode;
  for (const k of ['itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'layoutWrap', 'counterAxisSpacing']) try { s[k] = f[k]; } catch (e) { }
  for (const k of ['itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'counterAxisSpacing']) { const b = f.boundVariables && f.boundVariables[k]; if (b) try { s.setBoundVariable(k, V[Object.keys(V).find(n => V[n].id === b.id)]); } catch (e) { } }
  s.fills = [];
  s.clipsContent = false;
  try { s.layoutSizingHorizontal = f.layoutSizingHorizontal; s.layoutSizingVertical = f.layoutSizingVertical; } catch (e) { }
  s.primaryAxisSizingMode = f.primaryAxisSizingMode; s.counterAxisSizingMode = f.counterAxisSizingMode;
  if (f.layoutSizingHorizontal === 'FIXED' || f.layoutSizingVertical === 'FIXED') s.resize(f.width, f.height);
}

return { V, TS, ES, CM, log, init, build, buildSet, fixSizes, paint, bindNum, solid, recolorIcon };
