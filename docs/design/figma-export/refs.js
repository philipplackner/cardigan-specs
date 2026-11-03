const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const DIR = '/Users/philipplackner/Cardigan/docs/design';
(async () => {
  fs.mkdirSync(path.join(__dirname, 'ref'), { recursive: true });
  const b = await chromium.launch({ channel: 'chrome' }); const pg = await b.newPage({ viewport: { width: 1800, height: 1200 } });
  for (const p of ['auth', 'board-list', 'board-view', 'card-detail', 'labels', 'import-export']) {
    await pg.goto('file://' + path.join(DIR, p + '.html'));
    await pg.addStyleTag({ content: `*{animation:none!important;transition:none!important}.g-fw{width:auto!important;height:auto!important;overflow:visible!important}.g-fw>.fr{transform:none!important}.fr{border:0!important;border-radius:0!important}` });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
    const n = await pg.$$eval('figure.g-item', fs => fs.length);
    for (let i = 0; i < n; i++) {
      await pg.$$eval('figure.g-item', (fs, i) => fs.forEach((f, j) => { f.style.display = j === i ? '' : 'none'; }), i);
      await pg.locator('figure.g-item').nth(i).locator('.fr').first().screenshot({ path: path.join(__dirname, 'ref', `${p}-${i}.png`) });
    }
  }
  await b.close(); console.log('done');
})();
