import { test, expect } from "@playwright/test";

test("drives subscribers page layout", async ({ page }) => {
  await page.setContent(`
    <div id="topbar"><input id="search" /></div>
    <div id="tabs">
      <button data-tab="all">All</button>
      <button data-tab="weekly">Weekly</button>
      <button data-tab="biweekly">Bi-weekly</button>
      <button data-tab="monthly">Monthly</button>
    </div>
    <table id="table"><tbody></tbody></table>
    <div id="drawer" hidden></div>
    <script>
      const subs = [
        {id:1,name:'Alice',frequency:'weekly'},
        {id:2,name:'Bob',frequency:'weekly'},
        {id:3,name:'Carol',frequency:'biweekly'},
        {id:4,name:'Dave',frequency:'biweekly'},
        {id:5,name:'Eve',frequency:'monthly'},
        {id:6,name:'Frank',frequency:'monthly'},
      ];
      const tbody = document.querySelector('#table tbody');
      const drawer = document.getElementById('drawer');
      const search = document.getElementById('search');
      let tab = 'all';
      function render(){
        const term = search.value.toLowerCase();
        tbody.innerHTML='';
        subs.filter(s => (tab==='all' || s.frequency===tab) && s.name.toLowerCase().includes(term)).forEach(s=>{
          const tr = document.createElement('tr');
          tr.textContent = s.name;
          tr.addEventListener('click',()=>{drawer.hidden=false;drawer.textContent=s.name;});
          tbody.appendChild(tr);
        });
      }
      document.getElementById('tabs').addEventListener('click',e=>{
        if(e.target.dataset.tab){tab=e.target.dataset.tab;render();}
      });
      search.addEventListener('input',render);
      render();
    </script>
  `);

  await expect(page.locator("#table tbody tr")).toHaveCount(6);
  await page.click('#tabs button[data-tab="weekly"]');
  await expect(page.locator("#table tbody tr")).toHaveCount(2);
  await page.fill("#search", "Bob");
  await expect(page.locator("#table tbody tr")).toHaveCount(1);
  await page.click("#table tbody tr:first-child");
  await expect(page.locator("#drawer")).toBeVisible();
  await expect(page.locator("#drawer")).toHaveText("Bob");
});
