import { test, expect } from '@playwright/test';

test('toggle insights panel redraws charts', async ({ page }) => {
  await page.setContent(`
    <button id="toggle">Toggle</button>
    <div id="panel" style="display:none"><canvas id="chart"></canvas></div>
    <script>
      let redraws = 0;
      const chart = { update: () => redraws++ };
      document.getElementById('toggle').addEventListener('click', () => {
        const p = document.getElementById('panel');
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
        chart.update();
      });
      window.getRedraws = () => redraws;
    </script>
  `);
  await page.click('#toggle');
  await page.click('#toggle');
  const count = await page.evaluate(() => window.getRedraws());
  expect(count).toBe(2);
});

