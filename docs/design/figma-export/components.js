const { S, ICONS, LABELS } = require('./common');
const icons = require('./icons.json');

const H = (o, ch) => ({ t: 'F', L: 'H', sw: 'H', sh: 'H', ...o, ch });
const Vt = (o, ch) => ({ t: 'F', L: 'V', sw: 'H', sh: 'H', ...o, ch });
const T = (x, st, c, o) => ({ t: 'T', x, st, c, sw: 'H', sh: 'H', ...o });
const I = (k, o) => ({ t: 'I', k, sw: 'H', sh: 'H', ...o });
const ICON = (name, size, color, o) => ({ t: 'I', k: 'Icon/' + name, sw: 'X', sh: 'X', w: size, h: size, ic: color, ...o });
const SP = (o) => ({ t: 'F', n: 'Spacer', sw: 'F', sh: 'X', h: 1, ...o });
const SANS = (sz, w, lh, ls) => S('Sans', sz, w, lh, ls);
const MONO = (sz, w, lh, ls, up) => S('Mono', sz, w, lh, ls, up);
const grid = (axes) => axes.reduce((acc, [k, vals]) => acc.flatMap(a => vals.map(v => ({ ...a, [k]: v }))), [{}]);

const D = []; // ordered component definitions; each {set|comp, cat, desc, ...}

// ---------- Icons ----------
for (const n of ICONS) {
  D.push({
    set: 'Icon/' + n, cat: 'Icons', icon: true,
    desc: `Icon “${n}”. 24px grid drawn at 16px, 1.7px stroke, round caps. Swap via the Icon property of the parent component; recolor by overriding the stroke with a text or accent variable.`,
    root: { t: 'F', L: 0, n: 'Icon/' + n, sw: 'X', sh: 'X', w: 16, h: 16, ch: [{ t: 'SVG', n: 'Vector', svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6676" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[n]}</svg>` }] },
  });
}
const ICON_PREF = ICONS.map(n => 'Icon/' + n);

// ---------- Primitives ----------
D.push({
  set: 'Logo', cat: 'Brand', desc: 'Cardigan mark: three columns of different heights on a text-primary tile.',
  root: H({ n: 'Logo', sw: 'X', sh: 'X', w: 22, h: 22, p: 4, g: 2, r: 6, f: 'text/primary', C: 's' }, [
    { t: 'F', n: 'Bar 1', sw: 'F', sh: 'X', h: 14, r: 1, f: 'background/app' },
    { t: 'F', n: 'Bar 2', sw: 'F', sh: 'X', h: 9, r: 1, f: 'background/app' },
    { t: 'F', n: 'Bar 3', sw: 'F', sh: 'X', h: 11, r: 1, f: 'background/app' },
  ]),
});
D.push({
  set: 'Brand', cat: 'Brand', desc: 'Logo and wordmark. Sidebar on tablet/desktop, App bar on phones, Auth on log in and register.',
  variants: [['Sidebar', 15.5, [4, 8, 4, 8]], ['App bar', 17, [4, 8, 4, 4]], ['Auth', 18, [4, 8, 4, 8]]].map(([sz, fs, p]) => ({
    v: { Size: sz },
    root: H({ n: 'Brand', g: 9, p, C: 'c' }, [I('Logo'), T('Cardigan', SANS(fs, 600, 1, -0.02), 'text/primary', { n: 'Wordmark' })]),
  })),
});
D.push({
  set: 'Spinner', cat: 'Feedback', desc: 'Indeterminate progress ring. Inherits the color of its context: override the fill (text/on-accent inside primary buttons, accent/default when large).',
  variants: [['Small', 15, 2, 'text/primary'], ['Large', 24, 2.5, 'accent/default']].map(([sz, d, w, c]) => ({
    v: { Size: sz },
    root: { t: 'F', L: 0, n: 'Spinner', sw: 'X', sh: 'X', w: d, h: d, ch: [{ t: 'E', n: 'Ring', w: d, h: d, cn: ['SCALE', 'SCALE'], f: c, arc: { startingAngle: Math.PI / 4, endingAngle: Math.PI * 1.75, innerRadius: 1 - (2 * w) / d } }] },
  })),
});
D.push({
  set: 'Label dot', cat: 'Labels', setW: 640,
  desc: 'One of the 20 fixed label colors. Each color is a variable with a lighter value in dark mode. Resize freely (7px in labels, 10px in label rows).',
  variants: LABELS.map(([n]) => ({ v: { Color: n }, root: { t: 'F', L: 0, n: 'Dot', sw: 'X', sh: 'X', w: 10, h: 10, r: 999, f: 'label/' + n.toLowerCase() } })),
});
D.push({
  set: 'Key', cat: 'Data display', desc: 'Board key badge (2–5 uppercase letters).',
  root: H({ n: 'Key', p: [3, 5, 3, 5], r: 4, s: 'border/strong', f: 'background/surface', C: 'c' }, [T('CRD', MONO(11, 500, 1, 0.02), 'text/muted', { pt: 'Key' })]),
  props: [{ n: 'Key', t: 'TEXT', d: 'CRD' }],
});
D.push({
  set: 'Avatar', cat: 'Data display', desc: 'Account initial.',
  root: H({ n: 'Avatar', sw: 'X', sh: 'X', w: 26, h: 26, r: 999, f: 'accent/soft', A: 'c', C: 'c' }, [T('P', SANS(11.5, 600, 1), 'accent/default', { pt: 'Initial' })]),
  props: [{ n: 'Initial', t: 'TEXT', d: 'P' }],
});
D.push({
  set: 'Checkbox', cat: 'Inputs',
  variants: [false, true].map(on => ({
    v: { Checked: on ? 'True' : 'False' },
    root: H({ n: 'Checkbox', sw: 'X', sh: 'X', w: 16, h: 16, r: 4, s: on ? 'accent/default' : 'border/strong', sw2: 1.5, f: on ? 'accent/default' : 'background/surface', A: 'c', C: 'c' },
      on ? [ICON('check', 12, 'text/on-accent', { n: 'Check' })] : []),
  })),
});
D.push({
  set: 'Skeleton', cat: 'Feedback', desc: 'Loading placeholder block. Resize to the shape it stands in for; override the corner radius where needed.',
  root: { t: 'F', L: 0, n: 'Skeleton', sw: 'X', sh: 'X', w: 120, h: 12, r: 4, f: { g: [['background/skeleton', 0], ['background/skeleton-highlight', 0.5], ['background/skeleton', 1]] } },
});
D.push({
  set: 'Menu divider', cat: 'Overlays',
  root: Vt({ n: 'Menu divider', sw: 'X', w: 200, p: [4, 2, 4, 2] }, [{ t: 'F', n: 'Line', sw: 'F', sh: 'X', h: 1, f: 'border/default' }]),
});
D.push({
  set: 'Drop indicator', cat: 'Board', desc: 'Shows where a dragged card will land.',
  root: { t: 'F', L: 'H', n: 'Drop indicator', sw: 'X', sh: 'X', w: 250, h: 3, r: 2, f: 'accent/default', ch: [{ t: 'F', n: 'Knob', ab: [-4, -3], w: 9, h: 9, r: 999, f: 'accent/default' }] },
});

// ---------- Buttons ----------
const BTN_STYLES = {
  Primary: { f: 'accent/default', c: 'text/on-accent' },
  Secondary: { f: 'background/surface', c: 'text/primary', s: 'border/strong', e: 'Shadow/Small' },
  Ghost: { c: 'text/muted' },
  Danger: { f: 'danger/default', c: 'text/on-danger' },
  'Danger ghost': { c: 'danger/default' },
};
const BTN_SIZES = { Small: [30, 10, 13, 'height/control-sm'], Medium: [34, 13, 13.5, 'height/control-md'], 'Touch small': [38, 16, 14, 'height/control-touch-sm'], Touch: [44, 16, 15, 'height/control-touch'] };
D.push({
  set: 'Button', cat: 'Actions', setW: 1100,
  desc: 'Text button with optional leading icon or spinner. Touch sizes are used on phones. Stretch it (Fill) for full-width buttons.',
  variants: grid([['Style', Object.keys(BTN_STYLES)], ['Size', Object.keys(BTN_SIZES)], ['State', ['Default', 'Disabled']]]).map(v => {
    const st = BTN_STYLES[v.Style], [h, px, fs, hv] = BTN_SIZES[v.Size];
    return {
      v, root: H({ n: 'Button', sh: 'X', h, hv, p: [0, px, 0, px], g: 7, r: 6, A: 'c', C: 'c', f: st.f, s: st.s, e: st.e, o: v.State === 'Disabled' ? 0.45 : undefined }, [
        I('Spinner', { n: 'Spinner', v: { Size: 'Small' }, ov: [{ n: 'Ring', f: st.c }], pv: 'Loading' }),
        ICON('plus', 15, st.c, { n: 'Icon', pv: 'Show icon', pi: 'Icon' }),
        T('Button', SANS(fs, 500, 1), st.c, { n: 'Label', pt: 'Label' }),
      ]),
    };
  }),
  props: [{ n: 'Label', t: 'TEXT', d: 'Button' }, { n: 'Show icon', t: 'BOOLEAN', d: true }, { n: 'Icon', t: 'INSTANCE_SWAP', d: 'Icon/plus', pref: ICON_PREF }, { n: 'Loading', t: 'BOOLEAN', d: false }],
});
D.push({
  set: 'Icon button', cat: 'Actions',
  desc: 'Square icon-only button. Small sits in column headers, Large in the phone app bar. Selected marks an open menu or an active toggle.',
  variants: grid([['Style', ['Ghost', 'Boxed']], ['State', ['Default', 'Selected']], ['Size', ['Small', 'Medium', 'Large']]]).map(v => {
    const d = { Small: 28, Medium: 32, Large: 40 }[v.Size], is = v.Size === 'Large' ? 19 : 16;
    const sel = v.State === 'Selected';
    const boxed = v.Style === 'Boxed';
    return {
      v, root: H({ n: 'Icon button', sw: 'X', sh: 'X', w: d, h: d, wv: 'height/icon-button-' + v.Size.toLowerCase(), hv: 'height/icon-button-' + v.Size.toLowerCase(), r: 6, A: 'c', C: 'c', f: sel ? 'background/hover' : boxed ? 'background/surface' : null, s: boxed ? 'border/strong' : null, e: boxed ? 'Shadow/Small' : null }, [
        ICON('more', is, sel ? 'text/primary' : 'text/muted', { n: 'Icon', pi: 'Icon' }),
        H({ n: 'Badge', ab: [d - 17, 3], cn: ['MAX', 'MIN'], sh: 'X', h: 14, mw: 14, r: 7, p: [0, 3, 0, 3], f: 'accent/default', A: 'c', C: 'c', pv: 'Show badge' }, [T('1', MONO(9.5, 600, 14 / 9.5), 'text/on-accent', { pt: 'Badge', ta: 'CENTER' })]),
      ]),
    };
  }),
  props: [{ n: 'Icon', t: 'INSTANCE_SWAP', d: 'Icon/more', pref: ICON_PREF }, { n: 'Show badge', t: 'BOOLEAN', d: false }, { n: 'Badge', t: 'TEXT', d: '1' }],
});
D.push({
  set: 'Filter button', cat: 'Actions', desc: 'Label filter trigger in the board header. Active shows the number of selected labels.',
  variants: ['Default', 'Active'].map(s => ({
    v: { State: s },
    root: H({ n: 'Filter button', sh: 'X', h: 34, hv: 'height/control-md', p: [0, 11, 0, 11], g: 7, r: 6, C: 'c', s: s === 'Active' ? 'accent/default' : 'border/strong', f: s === 'Active' ? 'accent/soft' : 'background/surface', e: 'Shadow/Small' }, [
      ICON('label', 16, 'text/muted', { n: 'Icon' }),
      T('Labels', SANS(13.5, 400, 1.45), 'text/primary', { n: 'Label', pt: 'Label' }),
      H({ n: 'Count', p: [2, 5, 2, 5], r: 4, f: 'accent/default', pv: 'Show count' }, [T('1', MONO(11, 600, 1), 'text/on-accent', { pt: 'Count' })]),
      ICON('chevron-down', 16, 'text/muted', { n: 'Chevron' }),
    ]),
  })),
  props: [{ n: 'Label', t: 'TEXT', d: 'Labels' }, { n: 'Show count', t: 'BOOLEAN', d: false }, { n: 'Count', t: 'TEXT', d: '1' }],
});
D.push({
  set: 'Add card button', cat: 'Board', desc: 'Opens quick add at the bottom of a column.',
  variants: [['Default', [7, 6, 7, 6], 13], ['Touch', [10, 6, 10, 6], 14]].map(([sz, p, fs]) => ({
    v: { Size: sz },
    root: H({ n: 'Add card', sw: 'X', w: 258, p, g: 7, r: 6, C: 'c' }, [ICON('plus', 16, 'text/muted', { n: 'Icon' }), T('Add card', SANS(fs, 400, 1.45), 'text/muted', { n: 'Label', pt: 'Label' })]),
  })),
  props: [{ n: 'Label', t: 'TEXT', d: 'Add card' }],
});
D.push({
  set: 'Add column button', cat: 'Board',
  root: H({ n: 'Add column', sw: 'X', w: 220, p: [11, 12, 11, 12], g: 7, r: 10, C: 'c', s: 'border/strong', dash: [4, 3] }, [ICON('plus', 16, 'text/muted', { n: 'Icon' }), T('Add column', SANS(13, 400, 1.45), 'text/muted', { n: 'Label', pt: 'Label' })]),
  props: [{ n: 'Label', t: 'TEXT', d: 'Add column' }],
});

// ---------- Labels ----------
const LAB_SIZES = { Small: [7, 12, 'text/muted'], Medium: [10, 13.5, 'text/primary'], Large: [10, 15, 'text/primary'] };
D.push({
  set: 'Label', cat: 'Labels', desc: 'Color dot and name. Small on cards and in pickers, Medium/Large in the Labels list. Pick the color on the nested Dot.',
  variants: Object.entries(LAB_SIZES).map(([sz, [d, fs, c]]) => ({
    v: { Size: sz },
    root: H({ n: 'Label', g: 5, C: 'c' }, [I('Label dot', { n: 'Dot', v: { Color: 'Blue' }, sw: 'X', sh: 'X', w: d, h: d, ex: 1 }), T('api', SANS(fs, 500, 1), c, { n: 'Name', pt: 'Name' })]),
  })),
  props: [{ n: 'Name', t: 'TEXT', d: 'api' }],
});
D.push({
  set: 'Label chip', cat: 'Labels', desc: 'Label on the card detail, optionally removable.',
  root: H({ n: 'Label chip', p: [4, 9, 4, 8], g: 5, r: 999, C: 'c', s: 'border/default', f: 'background/surface' }, [
    I('Label dot', { n: 'Dot', v: { Color: 'Blue' }, sw: 'X', sh: 'X', w: 7, h: 7, ex: 1 }),
    T('api', SANS(12, 500, 1), 'text/primary', { n: 'Name', pt: 'Name' }),
    ICON('close-small', 12, 'text/muted', { n: 'Remove', pv: 'Removable' }),
  ]),
  props: [{ n: 'Name', t: 'TEXT', d: 'api' }, { n: 'Removable', t: 'BOOLEAN', d: false }],
});
D.push({
  set: 'Swatch', cat: 'Labels', desc: 'Color choice in the label dialog. Set the color on the nested Dot.',
  root: { t: 'F', L: 'H', n: 'Swatch', sw: 'X', sh: 'X', w: 30, h: 30, ch: [
    I('Label dot', { n: 'Dot', v: { Color: 'Red' }, sw: 'F', sh: 'F', ex: 1 }),
    { t: 'E', n: 'Ring', ab: [-4, -4], w: 38, h: 38, cn: ['STRETCH', 'STRETCH'], s: 'text/primary', sw2: 2, sa: 'INSIDE', pv: 'Selected' },
  ] },
  props: [{ n: 'Selected', t: 'BOOLEAN', d: false }],
});

// ---------- Inputs ----------
const IN_STATES = {
  Default: { s: 'border/strong', f: 'background/surface' },
  Focus: { s: 'accent/default', f: 'background/surface', e: 'Focus/Accent' },
  Error: { s: 'danger/default', f: 'background/surface', e: 'Focus/Danger' },
  'Read-only': { s: 'border/strong', f: 'background/column', c: 'text/muted' },
  Disabled: { s: 'border/strong', f: 'background/surface', o: 0.55 },
};
D.push({
  set: 'Input', cat: 'Inputs', setW: 1100,
  desc: 'Single-line text field. Content=Placeholder shows the faint placeholder color. Caret marks the focused insertion point.',
  variants: grid([['State', Object.keys(IN_STATES)], ['Size', ['Default', 'Touch']], ['Content', ['Value', 'Placeholder']]]).map(v => {
    const st = IN_STATES[v.State], touch = v.Size === 'Touch';
    const tc = v.Content === 'Placeholder' ? 'text/faint' : (st.c || 'text/primary');
    return {
      v, root: H({ n: 'Input', sw: 'X', w: 280, sh: 'X', h: touch ? 44 : 36, hv: touch ? 'height/control-touch' : 'height/input', p: [0, 10, 0, 10], g: 8, r: 6, C: 'c', s: st.s, f: st.f, e: st.e, o: st.o }, [
        ICON('search', 16, 'text/muted', { n: 'Leading icon', pv: 'Leading icon', pi: 'Leading' }),
        H({ n: 'Value', sw: 'F', g: 1, C: 'c' }, [
          T(v.Content === 'Placeholder' ? 'Placeholder' : 'Value', SANS(touch ? 15 : 13.5, 400, 1.45), tc, { n: 'Text', pt: 'Text', sw: 'H' }),
          { t: 'F', n: 'Caret', sw: 'X', sh: 'X', w: 1.5, h: touch ? 16.5 : 15, f: 'accent/default', pv: 'Caret' },
        ]),
        ICON('close', 16, 'text/muted', { n: 'Trailing icon', pv: 'Trailing icon', pi: 'Trailing' }),
      ]),
    };
  }),
  props: [{ n: 'Text', t: 'TEXT', d: 'Value' }, { n: 'Leading icon', t: 'BOOLEAN', d: false }, { n: 'Leading', t: 'INSTANCE_SWAP', d: 'Icon/search', pref: ICON_PREF }, { n: 'Trailing icon', t: 'BOOLEAN', d: false }, { n: 'Trailing', t: 'INSTANCE_SWAP', d: 'Icon/close', pref: ICON_PREF }, { n: 'Caret', t: 'BOOLEAN', d: false }],
});
const TA_TYPES = {
  'Multi-line': { p: [8, 10, 8, 10], st: (t) => SANS(t ? 15 : 13.5, 400, 1.5) },
  Title: { p: [8, 10, 8, 10], st: (t) => SANS(t ? 15 : 18, 600, 1.5, -0.01) },
  Description: { p: [10, 12, 10, 12], st: (t) => SANS(t ? 15 : 13.5, 400, 1.55) },
};
D.push({
  set: 'Text area', cat: 'Inputs', setW: 1100,
  desc: 'Multi-line field: Title for the card title, Description for the plain-text description, Multi-line for quick add.',
  variants: grid([['Type', Object.keys(TA_TYPES)], ['State', ['Default', 'Focus', 'Error']], ['Size', ['Default', 'Touch']]]).map(v => {
    const st = IN_STATES[v.State], ty = TA_TYPES[v.Type], touch = v.Size === 'Touch';
    return {
      v, root: H({ n: 'Text area', sw: 'X', w: 360, mh: touch ? 44 : 36, p: ty.p, r: 6, C: 's', s: st.s, f: st.f, e: st.e }, [
        T('Text', ty.st(touch), 'text/primary', { n: 'Text', pt: 'Text', sw: 'F' }),
      ]),
    };
  }),
  props: [{ n: 'Text', t: 'TEXT', d: 'Text' }],
});
D.push({
  set: 'Password rule', cat: 'Inputs', desc: 'Live password check. Shows a cross until the rule is met, then a check.',
  variants: [true, false].map(ok => ({
    v: { Met: ok ? 'True' : 'False' },
    root: H({ n: 'Rule', g: 5, C: 'c' }, [ICON(ok ? 'check' : 'close-small', 13, ok ? 'success/default' : 'text/muted', { n: 'Icon' }), T('12+ characters', SANS(12, 400, 1.45), ok ? 'success/default' : 'text/muted', { n: 'Text', pt: 'Text' })]),
  })),
  props: [{ n: 'Text', t: 'TEXT', d: '12+ characters' }],
});
D.push({
  set: 'Error message', cat: 'Inputs', desc: 'Inline validation message below a field.',
  root: H({ n: 'Error message', g: 5, C: 'c' }, [ICON('alert', 16, 'danger/default', { n: 'Icon' }), T('Something is wrong.', SANS(12, 400, 1.45), 'danger/default', { n: 'Text', pt: 'Text' })]),
  props: [{ n: 'Text', t: 'TEXT', d: 'Something is wrong.' }],
});
D.push({
  set: 'Field', cat: 'Inputs', desc: 'Label above a control. Put the control, help text or error message in the Control slot.',
  variants: [['Default', 12.5], ['Touch', 13.5]].map(([sz, fs]) => ({
    v: { Size: sz },
    root: Vt({ n: 'Field', sw: 'X', w: 320, g: 6 }, [
      T('Label', SANS(fs, 500, 1), 'text/primary', { n: 'Label', pt: 'Label', pv: 'Show label' }),
      Vt({ n: 'Control', sw: 'F', g: 6, slot: 'Control' }, []),
    ]),
  })),
  props: [{ n: 'Label', t: 'TEXT', d: 'Label' }, { n: 'Show label', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Option', cat: 'Inputs', desc: 'Checkbox row in the label filter and label picker. Set the checkbox and label on the nested instances.',
  variants: grid([['State', ['Default', 'Highlighted']], ['Size', ['Default', 'Touch']]]).map(v => ({
    v, root: H({ n: 'Option', sw: 'X', w: 260, p: v.Size === 'Touch' ? [12, 6, 12, 6] : 8, g: 10, r: 5, C: 'c', f: v.State === 'Highlighted' ? 'background/hover' : null }, [
      I('Checkbox', { n: 'Checkbox', v: { Checked: 'False' }, ex: 1 }),
      I('Label', { n: 'Label', v: { Size: 'Small' }, ex: 1 }),
    ]),
  })),
});

// ---------- Feedback ----------
D.push({
  set: 'Banner', cat: 'Feedback',
  variants: [['Error', 'danger/soft', 'border/danger-subtle', 'alert', 'danger/default'], ['Info', 'accent/soft', 'border/accent-subtle', 'info', 'accent/default']].map(([t, f, s, ic, icc]) => ({
    v: { Type: t },
    root: H({ n: 'Banner', sw: 'X', w: 332, p: [10, 12, 10, 12], g: 9, r: 8, C: 's', f, s }, [ICON(ic, 16, icc, { n: 'Icon' }), T('Message', SANS(13, 400, 1.45), 'text/primary', { n: 'Message', pt: 'Message', sw: 'F' })]),
  })),
  props: [{ n: 'Message', t: 'TEXT', d: 'Message' }],
});
D.push({
  set: 'Toast', cat: 'Feedback', desc: 'Short confirmation or error at the bottom of the screen.',
  variants: [['Success', 'success/default'], ['Error', 'danger/default']].map(([t, dc]) => ({
    v: { Type: t },
    root: H({ n: 'Toast', p: [10, 10, 10, 14], g: 12, r: 8, C: 'c', f: 'background/toast', e: 'Shadow/Popover' }, [
      { t: 'F', n: 'Dot', sw: 'X', sh: 'X', w: 8, h: 8, r: 999, f: dc },
      T('Message', SANS(13.5, 400, 1.45), 'text/toast', { n: 'Message', pt: 'Message' }),
      ICON('close', 16, 'text/toast', { n: 'Close', o: 0.7 }),
    ]),
  })),
  props: [{ n: 'Message', t: 'TEXT', d: 'Message' }],
});
D.push({
  set: 'Empty state', cat: 'Feedback', desc: 'Empty, error and zero-result states. Put buttons in the Actions slot.',
  variants: [['Default', 'text/muted'], ['Error', 'danger/default']].map(([t, ic]) => ({
    v: { Type: t },
    root: Vt({ n: 'Empty state', sw: 'X', w: 360, p: 32, g: 10, A: 'c', C: 'c' }, [
      H({ n: 'Icon box', sw: 'X', sh: 'X', w: 44, h: 44, r: 10, s: 'border/default', f: 'background/surface', e: 'Shadow/Small', A: 'c', C: 'c' }, [ICON(t === 'Error' ? 'cloud-off' : 'board', 20, ic, { n: 'Icon', pi: 'Icon' })]),
      Vt({ n: 'Title wrap', p: [6, 0, 0, 0], C: 'c' }, [T('Title', SANS(15, 600, 1.3), 'text/primary', { n: 'Title', pt: 'Title', ta: 'CENTER' })]),
      T('Description', SANS(13.5, 400, 1.45), 'text/muted', { n: 'Description', pt: 'Description', ta: 'CENTER', sw: 'F', xw: 322 }),
      H({ n: 'Actions', p: [6, 0, 0, 0], g: 8, A: 'c', C: 'c', slot: 'Actions' }, []),
    ]),
  })),
  props: [{ n: 'Title', t: 'TEXT', d: 'Title' }, { n: 'Description', t: 'TEXT', d: 'Description' }, { n: 'Icon', t: 'INSTANCE_SWAP', d: 'Icon/board', pref: ICON_PREF }],
});

// ---------- Menus & overlays ----------
const MI_TYPES = { Default: ['text/primary', 'text/muted', null], Highlighted: ['text/primary', 'text/muted', 'background/hover'], Danger: ['danger/default', 'danger/default', null], Disabled: ['text/faint', 'text/faint', null] };
D.push({
  set: 'Menu item', cat: 'Overlays',
  variants: [
    ...grid([['Type', Object.keys(MI_TYPES)], ['Size', ['Default', 'Touch']]]).map(v => {
      const [c, ic, f] = MI_TYPES[v.Type], touch = v.Size === 'Touch';
      return { v, root: H({ n: 'Menu item', sw: 'X', w: 200, p: touch ? 12 : [8, 10, 8, 10], g: 10, r: 5, C: 'c', f }, [ICON('edit', 16, ic, { n: 'Icon', pv: 'Show icon', pi: 'Icon' }), T('Menu item', SANS(touch ? 15 : 13.5, 400, 1.45), c, { n: 'Label', pt: 'Label' })]) };
    }),
    ...['Default', 'Touch'].map(sz => ({ v: { Type: 'Header', Size: sz }, root: H({ n: 'Menu item', sw: 'X', w: 200, p: sz === 'Touch' ? 12 : [8, 10, 6, 10], r: 5, C: 'c' }, [T('Signed in as', SANS(sz === 'Touch' ? 15 : 12, 400, 1.45), 'text/muted', { n: 'Label', pt: 'Label' })]) })),
  ],
  props: [{ n: 'Label', t: 'TEXT', d: 'Menu item' }, { n: 'Show icon', t: 'BOOLEAN', d: true }, { n: 'Icon', t: 'INSTANCE_SWAP', d: 'Icon/edit', pref: ICON_PREF }],
});
D.push({
  set: 'Menu', cat: 'Overlays', desc: 'Dropdown menu. Fill the Items slot with Menu items and Menu dividers (set them to Fill width).',
  variants: [['Default', 208], ['Touch', 232]].map(([sz, mw]) => ({
    v: { Size: sz },
    root: Vt({ n: 'Menu', mw, p: 4, r: 8, s: 'border/default', f: 'background/surface', e: 'Shadow/Popover' }, [Vt({ n: 'Items', sw: 'F', g: 1, slot: 'Items' }, [])]),
  })),
});
D.push({
  set: 'Popover', cat: 'Overlays', desc: 'Anchored panel for the label filter and label picker. Content goes in the Content slot.',
  root: Vt({ n: 'Popover', sw: 'X', w: 280, r: 10, s: 'border/default', f: 'background/surface', e: 'Shadow/Popover', cl: true }, [Vt({ n: 'Content', sw: 'F', slot: 'Content' }, [])]),
});
D.push({
  set: 'Dialog', cat: 'Overlays', setW: 1100,
  desc: 'Modal dialog. Fields go in Content, buttons in Actions (Touch: set buttons to Fill). Progress centers the text and shows a large spinner.',
  variants: grid([['Type', ['Default', 'Progress']], ['Size', ['Default', 'Touch']]]).map(v => {
    const touch = v.Size === 'Touch', prog = v.Type === 'Progress';
    const ta = prog ? 'CENTER' : undefined;
    const kids = [
      T('Title', SANS(touch ? 17 : 16, 600, 1.3, -0.01), 'text/primary', { n: 'Title', pt: 'Title', sw: 'F', ta }),
      T('Description', SANS(touch ? 14.5 : 13.5, 400, 1.45), 'text/muted', { n: 'Description', pt: 'Description', pv: 'Show description', sw: 'F', ta }),
    ];
    if (prog) kids.push(I('Spinner', { n: 'Spinner', v: { Size: 'Large' } }));
    else kids.push(Vt({ n: 'Content', sw: 'F', g: 16, slot: 'Content' }, []), H({ n: 'Actions', sw: 'F', g: 8, A: 'e', wr: 1, cg: 8, slot: 'Actions' }, []));
    return { v, root: Vt({ n: 'Dialog', sw: 'X', w: 420, p: prog ? [28, 24, 28, 24] : touch ? 22 : 20, g: 16, r: 12, s: 'border/default', f: 'background/surface', e: 'Shadow/Popover', C: prog ? 'c' : undefined }, kids) };
  }),
  props: [{ n: 'Title', t: 'TEXT', d: 'Title' }, { n: 'Description', t: 'TEXT', d: 'Description' }, { n: 'Show description', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Bottom sheet', cat: 'Overlays', desc: 'Phone sheet anchored to the bottom edge. Content goes in the Content slot.',
  root: Vt({ n: 'Bottom sheet', sw: 'X', w: 390, p: [8, 16, 16, 16], g: 12, r: [16, 16, 0, 0], s: 'border/default', sw2: [1, 0, 0, 0], f: 'background/surface', e: 'Shadow/Popover' }, [
    H({ n: 'Grab', sw: 'F', A: 'c', p: [0, 0, 4, 0] }, [{ t: 'F', n: 'Handle', sw: 'X', sh: 'X', w: 36, h: 4, r: 2, f: 'border/strong' }]),
    Vt({ n: 'Content', sw: 'F', g: 12, slot: 'Content' }, []),
  ]),
});

// ---------- Navigation ----------
const NAV = { Default: ['text/primary', 'text/muted', 400], Selected: ['text/primary', 'accent/default', 500], Dim: ['text/muted', 'text/muted', 400] };
D.push({
  set: 'Nav item', cat: 'Navigation',
  variants: Object.entries(NAV).map(([st, [c, ic, w]]) => ({
    v: { State: st },
    root: H({ n: 'Nav item', sw: 'X', w: 228, p: [7, 8, 7, 8], g: 9, r: 6, C: 'c', f: st === 'Selected' ? 'background/surface' : null, s: st === 'Selected' ? 'border/default' : null, e: st === 'Selected' ? 'Shadow/Small' : null }, [
      ICON('board', 16, ic, { n: 'Icon', pi: 'Icon' }),
      T('Cardigan v1', SANS(13.5, w, 1.45), c, { n: 'Label', pt: 'Label', sw: 'F', tr: 1 }),
      T('CRD', MONO(11, 400, 1), 'text/faint', { n: 'Key', pt: 'Key', pv: 'Show key' }),
    ]),
  })),
  props: [{ n: 'Label', t: 'TEXT', d: 'Cardigan v1' }, { n: 'Icon', t: 'INSTANCE_SWAP', d: 'Icon/board', pref: ICON_PREF }, { n: 'Show key', t: 'BOOLEAN', d: true }, { n: 'Key', t: 'TEXT', d: 'CRD' }],
});
D.push({
  set: 'Sidebar', cat: 'Navigation', desc: 'Persistent navigation on tablet (224) and desktop (248). Board items go in the Boards slot; select the active item on its nested instance.',
  root: Vt({ n: 'Sidebar', sw: 'X', w: 248, sh: 'X', h: 900, p: [14, 10, 10, 10], g: 18, f: 'background/sidebar', s: 'border/default', sw2: [0, 1, 0, 0] }, [
    I('Brand', { n: 'Brand', v: { Size: 'Sidebar' } }),
    Vt({ n: 'Main nav', sw: 'F', g: 1 }, [
      I('Nav item', { n: 'All boards', v: { State: 'Selected' }, P: { Label: 'All boards', Icon: 'Icon/boards', 'Show key': false }, sw: 'F', ex: 1 }),
      I('Nav item', { n: 'Labels', v: { State: 'Default' }, P: { Label: 'Labels', Icon: 'Icon/label', 'Show key': false }, sw: 'F', ex: 1 }),
    ]),
    Vt({ n: 'Boards nav', sw: 'F', g: 1 }, [
      H({ n: 'Heading', sw: 'F', p: [2, 8, 8, 8] }, [T('Boards', MONO(11, 500, 1, 0.06, true), 'text/muted', { n: 'Heading' })]),
      Vt({ n: 'Boards', sw: 'F', g: 1, slot: 'Boards' }, []),
      I('Nav item', { n: 'New board', v: { State: 'Dim' }, P: { Label: 'New board', Icon: 'Icon/plus', 'Show key': false }, sw: 'F' }),
    ]),
    SP({ sh: 'F', h: 1 }),
    Vt({ n: 'Footer', sw: 'F', p: [8, 0, 0, 0], s: 'border/default', sw2: [1, 0, 0, 0] }, [
      H({ n: 'Account', sw: 'F', p: [4, 4, 4, 8], g: 9, C: 'c' }, [
        I('Avatar', { n: 'Avatar', P: { Initial: 'P' }, ex: 1, sw: 'K', sh: 'K' }),
        T('philipp@example.com', SANS(13, 400, 1.45), 'text/primary', { n: 'Email', pt: 'Email', sw: 'F', tr: 1 }),
        I('Icon button', { n: 'Log out', v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/log-out' } }),
      ]),
    ]),
  ]),
  props: [{ n: 'Email', t: 'TEXT', d: 'philipp@example.com' }],
});
D.push({
  set: 'Page header', cat: 'Navigation', desc: 'Title bar of a page on tablet/desktop. Buttons, search and filters go in the Actions slot.',
  root: H({ n: 'Page header', sw: 'X', w: 1192, mh: 60, p: [12, 20, 12, 20], g: 10, C: 'c', f: 'background/app', s: 'border/default', sw2: [0, 0, 1, 0] }, [
    T('Title', SANS(18, 600, 1.2, -0.015), 'text/primary', { n: 'Title', pt: 'Title' }),
    I('Key', { n: 'Key', pv: 'Show key', ex: 1 }),
    T('6 boards', MONO(12, 400, 1), 'text/muted', { n: 'Meta', pt: 'Meta', pv: 'Show meta' }),
    SP(),
    H({ n: 'Actions', g: 10, C: 'c', slot: 'Actions' }, []),
  ]),
  props: [{ n: 'Title', t: 'TEXT', d: 'Title' }, { n: 'Show key', t: 'BOOLEAN', d: false }, { n: 'Show meta', t: 'BOOLEAN', d: true }, { n: 'Meta', t: 'TEXT', d: '6 boards' }],
});
D.push({
  set: 'App bar', cat: 'Navigation', setW: 1000,
  desc: 'Phone top bar. Brand on the board list, Title with a back button inside a board, Centered on the card detail. Raised adds the divider once content scrolls under it.',
  variants: grid([['Type', ['Brand', 'Title', 'Centered']], ['Raised', ['False', 'True']]]).map(v => {
    const raised = v.Raised === 'True';
    const kids = [];
    if (v.Type === 'Brand') kids.push(I('Brand', { n: 'Brand', v: { Size: 'App bar' } }), SP());
    else kids.push(H({ n: 'Leading', C: 'c', slot: 'Leading' }, []));
    if (v.Type === 'Title') kids.push(Vt({ n: 'Title block', sw: 'F', g: 3, p: [0, 0, 0, 2] }, [
      T('Title', SANS(16.5, 600, 1.15, -0.01), 'text/primary', { n: 'Title', pt: 'Title', sw: 'F', tr: 1 }),
      T('Subtitle', MONO(11.5, 400, 1), 'text/muted', { n: 'Subtitle', pt: 'Subtitle', pv: 'Show subtitle' }),
    ]));
    if (v.Type === 'Centered') kids.push(T('CRD-109', MONO(13, 500, 1), 'text/muted', { n: 'Title', pt: 'Title', sw: 'F', ta: 'CENTER' }));
    kids.push(H({ n: 'Actions', C: 'c', g: 2, slot: 'Actions' }, []));
    return { v, root: H({ n: 'App bar', sw: 'X', w: 390, mh: 56, p: [6, 8, 6, 10], g: 2, C: 'c', f: 'background/app', s: raised ? 'border/default' : null, sw2: raised ? [0, 0, 1, 0] : undefined, e: raised ? 'Shadow/Raised' : undefined }, kids) };
  }),
  props: [{ n: 'Title', t: 'TEXT', d: 'Title' }, { n: 'Subtitle', t: 'TEXT', d: 'Subtitle' }, { n: 'Show subtitle', t: 'BOOLEAN', d: true }],
});

// ---------- Board ----------
const CARD_STATES = {
  Default: { s: 'border/default', f: 'background/surface', e: 'Shadow/Small' },
  Selected: { s: 'accent/default', f: 'background/surface', e: 'Focus/Accent' },
  Dragging: { s: 'accent/default', f: 'background/surface', e: 'Shadow/Drag' },
  Placeholder: { s: 'border/strong', sw2: 1.5, dash: [5, 4] },
};
D.push({
  set: 'Card', cat: 'Board',
  desc: 'Card tile in a column: ID, title and labels (Labels slot, Small labels). Dragging is shown tilted 2.2°; Placeholder marks the drop gap.',
  variants: grid([['State', Object.keys(CARD_STATES)], ['Size', ['Default', 'Touch']]]).map(v => {
    const st = CARD_STATES[v.State], touch = v.Size === 'Touch', ph = v.State === 'Placeholder';
    const o = ph ? 0 : undefined;
    return {
      v, root: Vt({ n: 'Card', sw: 'X', w: 258, p: touch ? [12, 14, 12, 14] : [10, 12, 11, 12], g: 7, r: 8, ...st }, [
        T('CRD-101', MONO(11, 500, 1), 'text/muted', { n: 'ID', pt: 'ID', o }),
        T('Card title', SANS(touch ? 14.5 : 13.5, 500, 1.38), 'text/primary', { n: 'Title', pt: 'Title', sw: 'F', o }),
        H({ n: 'Labels', sw: 'F', g: 10, cg: 4, wr: 1, slot: 'Labels', pv: 'Show labels', o }, []),
      ]),
    };
  }),
  props: [{ n: 'ID', t: 'TEXT', d: 'CRD-101' }, { n: 'Title', t: 'TEXT', d: 'Card title' }, { n: 'Show labels', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Column', cat: 'Board', desc: 'Board column: header with name, card count and menu; cards in the Cards slot; Add card at the bottom.',
  variants: [['Default', 276], ['Touch', 300]].map(([sz, w]) => ({
    v: { Size: sz },
    root: Vt({ n: 'Column', sw: 'X', w, p: 8, g: 8, r: 10, s: 'border/default', f: 'background/column' }, [
      H({ n: 'Header', sw: 'F', mh: 30, p: [2, 2, 2, 6], g: 8, C: 'c' }, [
        T('To do', SANS(13.5, 600, 1), 'text/primary', { n: 'Name', pt: 'Name' }),
        T('4', MONO(11.5, 400, 1), 'text/muted', { n: 'Count', pt: 'Count' }),
        SP(),
        I('Icon button', { n: 'Menu button', v: { Style: 'Ghost', State: 'Default', Size: 'Small' }, P: { Icon: 'Icon/more' }, ex: 1 }),
      ]),
      Vt({ n: 'Cards', sw: 'F', g: 8, slot: 'Cards' }, []),
      I('Add card button', { n: 'Add card', v: { Size: sz === 'Touch' ? 'Touch' : 'Default' }, sw: 'F', pv: 'Show add card' }),
    ]),
  })),
  props: [{ n: 'Name', t: 'TEXT', d: 'To do' }, { n: 'Count', t: 'TEXT', d: '4' }, { n: 'Show add card', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Board tile', cat: 'Boards', desc: 'Board in the board list grid (tablet/desktop).',
  variants: ['Default', 'Hover'].map(st => ({
    v: { State: st },
    root: Vt({ n: 'Board tile', sw: 'X', w: 280, p: [14, 14, 12, 14], g: 10, r: 8, s: st === 'Hover' ? 'border/strong' : 'border/default', f: 'background/surface', e: 'Shadow/Small' }, [
      H({ n: 'Top', sw: 'F', sh: 'X', h: 26, C: 'c' }, [I('Key', { n: 'Key', ex: 1 })]),
      I('Icon button', { n: 'Menu button', ab: [240, 10], cn: ['MAX', 'MIN'], v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/more' }, ex: 1 }),
      T('Board name', SANS(15, 600, 1.3, -0.01), 'text/primary', { n: 'Name', pt: 'Name', sw: 'F' }),
      H({ n: 'Meta', sw: 'F', p: [10, 0, 0, 0], g: 10, A: 'b', s: 'border/default', sw2: [1, 0, 0, 0] }, [
        T('12 cards', MONO(12, 400, 1), 'text/muted', { n: 'Cards', pt: 'Cards' }),
        T('Updated 2 hours ago', MONO(12, 400, 1), 'text/muted', { n: 'Updated', pt: 'Updated' }),
      ]),
    ]),
  })),
  props: [{ n: 'Name', t: 'TEXT', d: 'Board name' }, { n: 'Cards', t: 'TEXT', d: '12 cards' }, { n: 'Updated', t: 'TEXT', d: 'Updated 2 hours ago' }],
});
D.push({
  set: 'Board row', cat: 'Boards', desc: 'Board in the phone board list.',
  root: H({ n: 'Board row', sw: 'X', w: 356, p: [12, 6, 12, 14], g: 10, C: 'c' }, [
    Vt({ n: 'Main', sw: 'F', g: 6 }, [
      T('Board name', SANS(15.5, 600, 1.3, -0.01), 'text/primary', { n: 'Name', pt: 'Name', sw: 'F', tr: 1 }),
      H({ n: 'Sub', g: 8, C: 'c' }, [
        I('Key', { n: 'Key', ex: 1 }),
        T('12 cards', MONO(12, 400, 1), 'text/muted', { n: 'Cards', pt: 'Cards' }),
        T('·', MONO(12, 400, 1), 'text/muted', { n: 'Dot' }),
        T('2 hours ago', MONO(12, 400, 1), 'text/muted', { n: 'Updated', pt: 'Updated' }),
      ]),
    ]),
    I('Icon button', { n: 'Menu button', v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/more' }, ex: 1 }),
    { t: 'F', n: 'Divider', ab: [0, 0], w: 356, h: 1, fitB: 1, cn: ['STRETCH', 'MAX'], f: 'border/default', pv: 'Show divider' },
  ]),
  props: [{ n: 'Name', t: 'TEXT', d: 'Board name' }, { n: 'Cards', t: 'TEXT', d: '12 cards' }, { n: 'Updated', t: 'TEXT', d: '2 hours ago' }, { n: 'Show divider', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Label row', cat: 'Labels', desc: 'Row in the Labels list with edit and delete actions.',
  variants: [['Default', [10, 8, 10, 16], 'Medium'], ['Touch', [14, 6, 14, 16], 'Large']].map(([sz, p, ls]) => ({
    v: { Size: sz },
    root: H({ n: 'Label row', sw: 'X', w: 760, p, g: 12, C: 'c' }, [
      I('Label', { n: 'Label', v: { Size: ls }, sw: 'F', ex: 1 }),
      I('Icon button', { n: 'Edit', v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/edit' } }),
      I('Icon button', { n: 'Delete', v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/trash' } }),
      { t: 'F', n: 'Divider', ab: [0, 0], w: 760, h: 1, fitB: 1, cn: ['STRETCH', 'MAX'], f: 'border/default', pv: 'Show divider' },
    ]),
  })),
  props: [{ n: 'Show divider', t: 'BOOLEAN', d: true }],
});
D.push({
  set: 'Panel', cat: 'Card detail', desc: 'Card detail side panel on tablet (420) and desktop (452). Fields go in Body, buttons in Footer.',
  root: Vt({ n: 'Panel', sw: 'X', w: 452, sh: 'X', h: 900, f: 'background/surface', s: 'border/default', sw2: [0, 0, 0, 1], e: 'Shadow/Panel' }, [
    H({ n: 'Header', sw: 'F', mh: 56, p: [12, 12, 12, 20], g: 6, C: 'c', s: 'border/default', sw2: [0, 0, 1, 0] }, [
      T('CRD-109', MONO(12.5, 400, 1.45), 'text/muted', { n: 'Card ID', pt: 'Card ID' }),
      T('in In progress', SANS(12.5, 400, 1.45), 'text/muted', { n: 'Column', pt: 'Column' }),
      SP(),
      I('Icon button', { n: 'Close', v: { Style: 'Ghost', State: 'Default', Size: 'Medium' }, P: { Icon: 'Icon/close' } }),
    ]),
    Vt({ n: 'Body', sw: 'F', sh: 'F', p: 20, g: 20, slot: 'Body' }, []),
    H({ n: 'Footer', sw: 'F', p: [12, 16, 12, 12], g: 8, C: 'c', s: 'border/default', sw2: [1, 0, 0, 0], f: 'background/surface', slot: 'Footer' }, []),
  ]),
  props: [{ n: 'Card ID', t: 'TEXT', d: 'CRD-109' }, { n: 'Column', t: 'TEXT', d: 'in In progress' }],
});
D.push({
  set: 'File row', cat: 'Import & export', desc: 'Chosen file with its size.',
  root: H({ n: 'File row', sw: 'X', w: 380, p: [10, 12, 10, 12], g: 10, r: 8, C: 'c', s: 'border/default' }, [
    ICON('file', 16, 'text/primary', { n: 'Icon' }),
    T('board-backup.json', SANS(13, 400, 1.45), 'text/primary', { n: 'Name', pt: 'Name' }),
    SP(),
    T('14 KB', MONO(12, 400, 1.45), 'text/muted', { n: 'Size', pt: 'Size' }),
  ]),
  props: [{ n: 'Name', t: 'TEXT', d: 'board-backup.json' }, { n: 'Size', t: 'TEXT', d: '14 KB' }],
});
D.push({
  set: 'Drop zone', cat: 'Import & export', desc: 'Web import target. Over is shown while a file is dragged over it.',
  variants: [['Default', 'border/strong', 'background/app', 'text/muted', 'file', 'Drop a board export here'], ['Over', 'accent/default', 'accent/soft', 'accent/default', 'download', 'Release to import']].map(([st, s, f, ic, icon, title]) => ({
    v: { State: st },
    root: Vt({ n: 'Drop zone', sw: 'X', w: 380, p: [28, 16, 28, 16], g: 8, r: 10, A: 'c', C: 'c', s, sw2: 1.5, dash: [6, 4], f }, [
      ICON(icon, 24, ic, { n: 'Icon' }),
      T(title, SANS(14, 600, 1.45), 'text/primary', { n: 'Title', pt: 'Title', ta: 'CENTER' }),
      T('or browse files', SANS(13, 400, 1.45), 'text/muted', { n: 'Hint', pv: 'Show hint', ta: 'CENTER', seg: [[3, 15, { c: 'accent/default', st: SANS(13, 500, 1.45) }]] }),
    ]),
  })),
  props: [{ n: 'Title', t: 'TEXT', d: 'Drop a board export here' }, { n: 'Show hint', t: 'BOOLEAN', d: true }],
});

module.exports = { D, H, Vt, T, I, ICON, SP, SANS, MONO };
