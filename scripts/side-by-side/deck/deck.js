// The before/after deck: one slide per screen, each a pair of device-sized panes scaled to
// fit, with the neighbouring slides on the strip below. A pane shows the full-length capture
// or, in Live, the app itself: the base build under /side-by-side/before/ and this build at
// /, each framed with its own demo wallet (shim.js keeps their storage apart from the
// wallet a person keeps on this origin).

const BASE = "/side-by-side";
const VERSIONS = {
  before: { app: BASE + "/before", prefix: "sbs-before:", frame: "sbs-before" },
  after: { app: "", prefix: "sbs-after:", frame: "sbs-after" },
};
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const manifest = await (
  await fetch(`${BASE}/manifest.json`, { cache: "no-cache" })
).json();
const slides = manifest.shots;
const sections = [...new Set(slides.map((s) => s.section))];
const seeds = {};

const prefs = JSON.parse(localStorage.getItem("sbs-deck") || "{}");
const state = {
  index: Math.max(
    0,
    slides.findIndex((s) => s.id === location.hash.slice(1))
  ),
  live: prefs.live ?? true,
  view: prefs.view ?? (innerWidth < 900 ? "flip" : "side"),
  sync: prefs.sync ?? true,
  shown: "after",
};
const savePrefs = () =>
  localStorage.setItem(
    "sbs-deck",
    JSON.stringify({ live: state.live, view: state.view, sync: state.sync })
  );

const stage = $("stage");
const panes = Object.fromEntries(
  [...document.querySelectorAll(".pane")].map((el) => [
    el.dataset.version,
    {
      el,
      version: el.dataset.version,
      box: el.querySelector(".pane__box"),
      frame: el.querySelector(".pane__frame"),
      scroller: el.querySelector(".pane__scroll"),
      img: el.querySelector("img"),
      status: el.querySelector(".pane__state"),
      iframe: null,
      run: 0,
    },
  ])
);
for (const [v, ref] of Object.entries(manifest.refs ?? {}))
  panes[v].el.querySelector(".pane__ref").textContent = ref;

// ---------------------------------------------------------------------------------------
// Layout: both panes are the slide's viewport, scaled by one factor to fit the stage.

function layout() {
  const { viewport } = slides[state.index];
  const style = getComputedStyle(stage);
  const width =
    stage.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  const height =
    stage.clientHeight -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom) -
    30;
  const count = state.view === "side" ? 2 : 1;
  const gap = parseFloat(style.columnGap) * (count - 1);
  const limit = viewport.width > 600 ? 1 : 1.25;
  const fit = Math.max(
    0.2,
    Math.min(
      limit,
      height / viewport.height,
      (width - gap) / count / viewport.width
    )
  );
  // A whole number of pixels across, so the framed app sees exactly the slide's width.
  const scale = Math.floor(viewport.width * fit) / viewport.width;
  for (const pane of Object.values(panes)) {
    pane.box.style.width = `${Math.round(viewport.width * scale)}px`;
    pane.box.style.height = `${Math.ceil(viewport.height * scale)}px`;
    pane.frame.style.width = `${viewport.width}px`;
    pane.frame.style.height = `${viewport.height}px`;
    // zoom, not a transform: a transformed frame samples its backdrop blur (the app's
    // sheet backdrop) at the wrong scale.
    pane.frame.style.zoom = String(scale);
  }
}
new ResizeObserver(layout).observe(stage);

// ---------------------------------------------------------------------------------------
// Scrolling both panes together. A page that is shorter stops at its own end.

let scrolling = null;
function mirrorScroll(from, top) {
  if (!state.sync || (scrolling && scrolling !== from)) return;
  scrolling = from;
  const other = panes[from === "before" ? "after" : "before"];
  other.scroller.scrollTop = top;
  try {
    other.iframe?.contentWindow?.scrollTo({ top, behavior: "instant" });
  } catch (e) {
    /* the frame is between documents */
  }
  clearTimeout(mirrorScroll.release);
  mirrorScroll.release = setTimeout(() => (scrolling = null), 80);
}
for (const pane of Object.values(panes))
  pane.scroller.addEventListener(
    "scroll",
    () => mirrorScroll(pane.version, pane.scroller.scrollTop),
    { passive: true }
  );

// ---------------------------------------------------------------------------------------
// Live panes.

const real = window.localStorage;
const appOf = (win) =>
  win.document.querySelector("#q-app")?.__vue_app__?.config.globalProperties;
async function ready(pane, run) {
  const started = Date.now();
  while (Date.now() - started < 25000) {
    if (pane.run !== run) return false;
    try {
      const win = pane.iframe.contentWindow;
      if (
        win.document.readyState === "complete" &&
        appOf(win)?.$pinia?._s.has("mints")
      )
        return true;
    } catch (e) {
      /* still loading */
    }
    await sleep(120);
  }
  throw new Error("the app did not start");
}
function load(pane, url) {
  pane.iframe.classList.remove("is-ready");
  return new Promise((resolve) => {
    pane.iframe.addEventListener("load", resolve, { once: true });
    pane.iframe.src = url;
  });
}

// The demo wallet: the capture's stored settings and mints go into this version's storage
// namespace before the app loads; its proofs and history go in through the app's own stores.
async function seedStorage(version) {
  const { prefix } = VERSIONS[version];
  const seed = (seeds[version] ??= await (
    await fetch(`${BASE}/seed-${version}.json`)
  ).json());
  if (real.getItem(prefix + "sbs.seed") === manifest.capturedAt) return seed;
  for (const key of Object.keys(real))
    if (key.startsWith(prefix)) real.removeItem(key);
  for (const db of (await indexedDB.databases?.()) ?? [])
    if (db.name.startsWith(prefix)) indexedDB.deleteDatabase(db.name);
  for (const [key, value] of Object.entries(seed.localStorage))
    real.setItem(prefix + key, value);
  real.setItem(prefix + "sbs.seed", manifest.capturedAt);
  return seed;
}

const isVisible = (el) =>
  !!el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
const nameOf = (el) =>
  (el.getAttribute("aria-label") || el.textContent || "").trim();
function find(doc, [kind, value]) {
  const scope =
    [...doc.querySelectorAll(".q-dialog")].filter(isVisible).pop() ?? doc;
  if (kind === "tab") {
    const tabs = [...doc.querySelectorAll(".q-tab")];
    return typeof value === "number"
      ? tabs[value]
      : tabs.find((t) => t.textContent.includes(value));
  }
  if (kind === "testid")
    return [...doc.querySelectorAll(`[data-testid="${value}"]`)].find(
      isVisible
    );
  if (kind === "css") return [...doc.querySelectorAll(value)].find(isVisible);
  if (kind === "btn") {
    const re = new RegExp(value, "i");
    return [...scope.querySelectorAll("button, [role=button], a.q-btn")]
      .filter((b) => isVisible(b) && re.test(nameOf(b)))
      .pop();
  }
  if (kind === "click") {
    for (const text of [value].flat()) {
      const hit = [...doc.querySelectorAll("body *")]
        .filter(
          (el) =>
            el.textContent.trim() === text &&
            isVisible(el) &&
            ![...el.children].some((c) => c.textContent.trim() === text)
        )
        .pop();
      if (hit) return hit;
    }
  }
  return null;
}
async function runStep(win, step) {
  const [kind, value, settle] = step;
  const doc = win.document;
  if (kind === "wait") return sleep(Math.min(value, 4000));
  if (kind === "scrollEnd") {
    win.scrollTo(0, doc.documentElement.scrollHeight);
  } else if (kind === "type") {
    for (const key of value) {
      (doc.activeElement ?? doc.body).dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        })
      );
      await sleep(60);
    }
  } else {
    let el = null;
    for (let i = 0; i < 40 && !(el = find(doc, step)); i++) await sleep(100);
    if (!el) throw new Error(`could not find ${[value].flat().join(" / ")}`);
    el.click();
  }
  await sleep(settle ?? 800);
}

async function showLive(pane, slide) {
  const run = ++pane.run;
  const { app, prefix, frame } = VERSIONS[pane.version];
  const set = (text, kind = "") => {
    if (pane.run !== run) return;
    pane.status.textContent = text;
    pane.status.dataset.kind = kind;
  };
  if (!pane.iframe) {
    pane.iframe = document.createElement("iframe");
    pane.iframe.name = frame;
    pane.iframe.title = `${pane.version}: live app`;
    pane.frame.append(pane.iframe);
  }
  set("Loading…");
  try {
    const seed = await seedStorage(pane.version);
    real.setItem(prefix + "cashu.theme", slide.theme);
    real.setItem(
      prefix + "cashu.darkMode",
      slide.dark ? "__q_bool|1" : "__q_bool|0"
    );
    real.setItem(prefix + "cashu.language", slide.lang);
    // Start at the wallet like a person, then route inside the app: the base build only
    // applies its stored theme and mode from the wallet page.
    await load(pane, app + "/");
    if (!(await ready(pane, run))) return;
    if (!real.getItem(prefix + "sbs.wallet")) {
      const stores = appOf(pane.iframe.contentWindow).$pinia._s;
      await stores.get("proofs").addProofs(seed.proofs);
      for (const entry of seed.history)
        stores.get("tokens").persistHistoryToken(entry);
      real.setItem(prefix + "sbs.wallet", "1");
      await sleep(600);
      await load(pane, app + "/");
      if (!(await ready(pane, run))) return;
    }
    const win = pane.iframe.contentWindow;
    await sleep(500);
    const { path, steps } = {
      path: slide.path,
      steps: slide.steps,
      ...slide[pane.version],
    };
    if (path !== "/") {
      await appOf(win).$router.push(path);
      await sleep(700);
    }
    for (const step of steps) {
      if (pane.run !== run) return;
      await runStep(win, step);
    }
    if (pane.run !== run) return;
    win.addEventListener(
      "scroll",
      () => mirrorScroll(pane.version, win.scrollY),
      { passive: true }
    );
    pane.iframe.classList.add("is-ready");
    set("Live");
  } catch (error) {
    set(`Live unavailable (${error.message}); showing the capture`, "error");
  }
}

// ---------------------------------------------------------------------------------------
// Slides.

const image = (slide, version) => `${BASE}/img/${slide.id}-${version}.webp`;
const thumb = (slide, version) => `${BASE}/thumb/${slide.id}-${version}.webp`;

function fillNear(button, slide) {
  button.disabled = !slide;
  if (!slide) return;
  button.querySelector("b").textContent = slide.title;
  const thumbs = button.querySelector(".near__thumbs");
  thumbs.classList.toggle("is-wide", slide.viewport.width > 600);
  [...thumbs.querySelectorAll("img")].forEach(
    (img, i) => (img.src = thumb(slide, i ? "after" : "before"))
  );
}

function render() {
  const slide = slides[state.index];
  const liveHere = state.live && slide.live;
  history.replaceState(null, "", "#" + slide.id);
  document.title = `${slide.title} · Cashu.me before and after`;
  $("title").textContent = slide.title;
  $("note").textContent = manifest.notes?.[slide.section] ?? "";
  $("section").value = slide.section;
  $("mode-live").setAttribute("aria-pressed", String(liveHere));
  $("mode-image").setAttribute("aria-pressed", String(!liveHere));
  $("mode-live").disabled = !slide.live;
  $("mode-live").title = slide.live
    ? "Both app versions, running (L)"
    : "This slide needs freshly minted test ecash: captures only";
  $("view-side").setAttribute("aria-pressed", String(state.view === "side"));
  $("view-flip").setAttribute("aria-pressed", String(state.view === "flip"));
  $("sync").setAttribute("aria-pressed", String(state.sync));
  stage.dataset.view = state.view;
  layout();

  for (const pane of Object.values(panes)) {
    pane.run++;
    pane.el.classList.toggle(
      "is-shown",
      state.view === "side" || state.shown === pane.version
    );
    pane.img.src = image(slide, pane.version);
    pane.img.alt = `${slide.title}, ${pane.version}`;
    pane.scroller.scrollTop = 0;
    pane.iframe?.classList.remove("is-ready");
    const failed = slide.errors?.[pane.version];
    pane.status.textContent = failed ? `Capture step failed: ${failed}` : "";
    pane.status.dataset.kind = failed ? "error" : "";
    if (liveHere) showLive(pane, slide);
    else if (pane.iframe) pane.iframe.src = "about:blank";
  }

  fillNear($("prev"), slides[state.index - 1]);
  fillNear($("next"), slides[state.index + 1]);
  const section = sections.indexOf(slide.section);
  const inSection = slides.filter((s) => s.section === slide.section);
  [...$("sections").children].forEach((button, i) => {
    button.classList.toggle("is-past", i < section);
    button.firstChild.style.width =
      i === section
        ? `${((inSection.indexOf(slide) + 1) / inSection.length) * 100}%`
        : "";
    button.setAttribute("aria-current", i === section ? "true" : "false");
  });
  $("count").innerHTML = `<b>${slide.section}</b> ${
    inSection.indexOf(slide) + 1
  } of ${inSection.length} · slide ${state.index + 1} of ${slides.length}`;
  // The neighbours' captures, so the next slide paints at once.
  for (const near of [slides[state.index + 1], slides[state.index - 1]])
    if (near)
      for (const v of ["before", "after"]) new Image().src = image(near, v);
}

function go(index) {
  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (next === state.index) return;
  state.index = next;
  render();
}
const goSection = (by) => {
  const target = sections[sections.indexOf(slides[state.index].section) + by];
  if (target) go(slides.findIndex((s) => s.section === target));
};
function toggle(key, value) {
  state[key] = value;
  savePrefs();
  render();
}

for (const name of sections) {
  const count = slides.filter((s) => s.section === name).length;
  $("section").add(new Option(`${name} (${count})`, name));
  const button = document.createElement("button");
  button.type = "button";
  button.title = name;
  button.setAttribute("aria-label", name);
  button.style.flex = String(count);
  button.append(document.createElement("i"));
  button.addEventListener("click", () =>
    go(slides.findIndex((s) => s.section === name))
  );
  $("sections").append(button);
}
$("section").addEventListener("change", (e) =>
  go(slides.findIndex((s) => s.section === e.target.value))
);
$("prev").addEventListener("click", () => go(state.index - 1));
$("next").addEventListener("click", () => go(state.index + 1));
$("mode-live").addEventListener("click", () => toggle("live", true));
$("mode-image").addEventListener("click", () => toggle("live", false));
$("view-side").addEventListener("click", () => toggle("view", "side"));
$("view-flip").addEventListener("click", () => toggle("view", "flip"));
$("sync").addEventListener("click", () => toggle("sync", !state.sync));
$("full").addEventListener("click", () =>
  document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen()
);
$("help").addEventListener("click", () => $("keys").showModal());
const flip = () => {
  state.shown = state.shown === "after" ? "before" : "after";
  for (const pane of Object.values(panes))
    pane.el.classList.toggle("is-shown", state.shown === pane.version);
};
stage.addEventListener("click", (e) => {
  if (state.view === "flip" && e.target.closest(".pane__label")) flip();
});
addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("select, dialog"))
    return;
  const keys = {
    ArrowRight: () => go(state.index + 1),
    ArrowLeft: () => go(state.index - 1),
    PageDown: () => go(state.index + 1),
    PageUp: () => go(state.index - 1),
    ArrowDown: () => goSection(1),
    ArrowUp: () => goSection(-1),
    Home: () => go(0),
    End: () => go(slides.length - 1),
    " ": () => (state.view === "flip" ? flip() : toggle("view", "flip")),
    v: () => toggle("view", state.view === "side" ? "flip" : "side"),
    l: () => slides[state.index].live && toggle("live", !state.live),
    s: () => toggle("sync", !state.sync),
    f: () => $("full").click(),
    "?": () => $("keys").showModal(),
  };
  const action = keys[e.key] ?? keys[e.key.toLowerCase()];
  if (!action) return;
  e.preventDefault();
  action();
});
addEventListener("hashchange", () => {
  const index = slides.findIndex((s) => s.id === location.hash.slice(1));
  if (index >= 0) go(index);
});
render();
