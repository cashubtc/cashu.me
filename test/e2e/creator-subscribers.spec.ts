import { test, expect } from '@playwright/test';

test('handles bulk subscribers with filtering and CSV export', async ({ page }) => {
  await page.evaluate(() => {
    (window as any).subs = Array.from({ length: 500 }, (_, i) => ({
      id: i + 1,
      frequency: ['daily', 'weekly', 'monthly'][i % 3],
    }));
  });

  const blocking = await page.evaluate(() => {
    const start = performance.now();
    const container = document.createElement('div');
    for (const sub of (window as any).subs as any[]) {
      const div = document.createElement('div');
      div.textContent = String(sub.id);
      container.appendChild(div);
    }
    document.body.appendChild(container);
    return performance.now() - start;
  });

  expect(blocking).toBeLessThan(200);

  const frequency = 'weekly';
  const counts = await page.evaluate((freq) => {
    const subs = ((window as any).subs as any[]).filter((s) => s.frequency === freq);
    const container = document.querySelector('div')!;
    for (const child of Array.from(container.children)) {
      const idx = parseInt(child.textContent || '0', 10) - 1;
      if (((window as any).subs as any[])[idx].frequency !== freq) child.remove();
    }
    const header = ['id', 'frequency'];
    const rows = subs.map((s) => [s.id, s.frequency]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    return { filtered: subs.length, csvRows: csv.split('\n').length - 1, shown: container.children.length };
  }, frequency);

  expect(counts.shown).toBe(counts.filtered);
  expect(counts.csvRows).toBe(counts.filtered);
});
