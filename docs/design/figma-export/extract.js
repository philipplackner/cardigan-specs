const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR = '/Users/philipplackner/Cardigan/docs/design';
const PAGES = ['auth', 'board-list', 'board-view', 'card-detail', 'labels', 'import-export'];

function pageScript() {
  const PROPS = ['display', 'flexDirection', 'flexWrap', 'rowGap', 'columnGap', 'justifyContent', 'alignItems', 'alignSelf', 'justifySelf',
    'flexGrow', 'flexShrink', 'flexBasis', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderRightStyle',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius', 'backgroundColor', 'backgroundImage', 'boxShadow', 'color',
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textAlign', 'opacity', 'position', 'overflow', 'transform',
    'gridTemplateColumns', 'gridTemplateRows', 'whiteSpace', 'textOverflow', 'visibility', 'top', 'right', 'bottom', 'left', 'width', 'height', 'maxWidth', 'minWidth', 'zIndex', 'placeContent', 'alignContent', 'justifyItems', 'clipPath', 'textDecorationLine'];
  const results = [];
  const figs = document.querySelectorAll('figure.g-item');
  figs.forEach((fig, idx) => {
    let c = fig.previousSibling, note = '';
    while (c && c.nodeType !== 1) { if (c.nodeType === 8) { note = c.nodeValue.trim(); break; } c = c.previousSibling; }
    const fr = fig.querySelector('.fr');
    const fb = fr.getBoundingClientRect();
    const rel = r => ({ x: +(r.left - fb.left).toFixed(2), y: +(r.top - fb.top).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) });
    function cs(el) { const s = getComputedStyle(el); const o = {}; PROPS.forEach(p => o[p] = s[p]); return o; }
    function pseudo(el, which) {
      const s = getComputedStyle(el, which);
      if (!s || s.content === 'none' || s.content === 'normal') return null;
      const o = {}; PROPS.forEach(p => o[p] = s[p]); o.content = s.content; return o;
    }
    function walk(el) {
      if (el.nodeType === 3) {
        const t = el.nodeValue;
        if (!t.trim()) {
          return null;
        }
        const rg = document.createRange(); rg.selectNodeContents(el);
        const rects = [...rg.getClientRects()].map(rel);
        if (!rects.length) return null;
        const b = rel(rg.getBoundingClientRect());
        return { k: 't', s: t, ...b, lines: rects.length };
      }
      if (el.nodeType !== 1) return null;
      const st = getComputedStyle(el);
      if (st.display === 'none') return null;
      const n = { k: 'e', tag: el.tagName.toLowerCase(), cls: [...el.classList], ...rel(el.getBoundingClientRect()), cs: cs(el) };
      for (const a of ['data-color', 'style', 'href']) if (el.hasAttribute(a)) n[a] = el.getAttribute(a);
      if (el.tagName.toLowerCase() === 'svg') { n.svg = el.innerHTML; return n; }
      const b = pseudo(el, '::before'), a = pseudo(el, '::after');
      if (b) n.before = b; if (a) n.after = a;
      n.ch = [...el.childNodes].map(walk).filter(Boolean);
      return n;
    }
    const grp = fig.closest('.g-group'); const group = grp && grp.querySelector('h3') ? grp.querySelector('h3').textContent.trim() : '';
    const m = note.match(/State: ([^|]+)/); const stateLabel = m ? m[1].trim() : fig.dataset.state; const nm = note.match(/Note: (.+)$/); 
    results.push({ idx, note: nm ? nm[1].replace(/-->$/,'').trim() : '', group, stateLabel, screen: fig.dataset.screen, state: fig.dataset.state, size: fig.dataset.size, w: fb.width, h: fb.height, frCls: [...fr.classList], root: walk(fr) });
  });
  return results;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1 });
  for (const p of PAGES) {
    await page.goto('file://' + path.join(DIR, p + '.html'));
    await page.addStyleTag({ content: `*{animation:none!important;transition:none!important}.g-fw{width:auto!important;height:auto!important;overflow:visible!important}.g-fw>.fr{transform:none!important}.fr{border:0!important;border-radius:0!important}` });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const data = await page.evaluate(pageScript);
    fs.writeFileSync(path.join(__dirname, 'raw', p + '.json'), JSON.stringify(data));
    console.log(p, data.length, (JSON.stringify(data).length / 1024).toFixed(0) + 'KB');
  }
  await browser.close();
})();
