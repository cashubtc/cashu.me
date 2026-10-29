import { chromium } from "playwright"; import fs from "node:fs"; import { VERSIONS } from "./setup.mjs";
const b = await chromium.launch();
for (const v of ["before", "after"]) {
  const c = await b.newContext({ storageState: JSON.parse(fs.readFileSync(`/tmp/sbs/state-${v}.json`)), viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const p = await c.newPage(); await p.goto(VERSIONS[v] + "/"); await p.waitForTimeout(2500);
  await p.getByTestId("wallet-send").click(); await p.waitForTimeout(800);
  await p.getByText("Ecash", { exact: true }).last().click({ force: true }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const name = [...document.querySelectorAll(".q-dialog *")].find((e) => e.children.length === 0 && e.textContent.trim() === "Minibits mint");
    let box = name; while (box && !(parseFloat(getComputedStyle(box).borderTopWidth) > 0 && box.getBoundingClientRect().width > 300)) box = box.parentElement;
    const img = box.querySelector("img, .q-avatar, .icon-circle, [class*=avatar]");
    const s = getComputedStyle(box), br = box.getBoundingClientRect(), ir = img?.getBoundingClientRect();
    return { cls: box.className, h: br.height, w: br.width, x: br.x, pad: s.padding, radius: s.borderRadius, avatar: ir && [ir.width, ir.height, ir.x - br.x], gap: s.columnGap, nameSize: getComputedStyle(name).fontSize };
  });
  console.log(v, JSON.stringify(r)); await c.close();
}
await b.close();
