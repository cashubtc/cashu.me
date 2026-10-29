# Turn the captured shots into the static /side-by-side page: deploy/side-by-side/.
# Run: python3 scripts/side-by-side/build-page.py <shots dir> <before label> <after label>
import json, os, sys, html
from PIL import Image

SHOTS, BEFORE, AFTER = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = os.path.join(os.path.dirname(__file__), "../../deploy/side-by-side")
os.makedirs(OUT + "/img", exist_ok=True)
LANGS = {"en-US": "English", "de-DE": "German", "es-ES": "Spanish", "fr-FR": "French", "it-IT": "Italian",
         "pt-BR": "Portuguese (Brazil)", "sv-SE": "Swedish", "cs-CZ": "Czech", "el-GR": "Greek", "tr-TR": "Turkish",
         "ar-SA": "Arabic (right to left)", "th-TH": "Thai", "ja-JP": "Japanese", "zh-CN": "Chinese (Simplified)"}
NOTES = {
    "Onboarding": "First run, with nothing stored.",
    "Wallet": "The home screen with the Minibits mint, a seeded balance and history.",
    "Receive": "Receive flows, including a pasted Minibits token.",
    "Send": "Send flows with amounts typed on the keypad.",
    "Testnut flows": "Real flows on testnut.cashu.space, a test mint with fake funds that pays its own invoices. Each screen starts with freshly minted test ecash: invoices, on-chain addresses, payment requests and tokens are real.",
    "Mints": "Mint details, reviews, discovery and restore.",
    "Settings": "The settings menu and every settings page.",
    "Themes": "The wallet in each of the nine themes, dark and light.",
    "Languages": "Wallet, settings and receive options in all fourteen languages.",
    "Desktop": "A 1280 by 832 window.",
}

def title(m):
    if m["section"] == "Themes":
        t, mode = m["id"].split("-")[1:3]
        return f"{t.capitalize()}, {mode}"
    if m["section"] == "Languages":
        lang, what = m["id"][5:10], m["id"][11:]
        return f"{LANGS[lang]}: {what.replace('receive', 'receive options')}"
    return m["title"]

manifest = json.load(open(os.path.join(SHOTS, "manifest.json")))
sections = []
for m in manifest:
    if not sections or sections[-1][0] != m["section"]:
        sections.append((m["section"], []))
    for v in ("before", "after"):
        im = Image.open(f"{SHOTS}/{m['id']}-{v}.png").convert("RGB")
        im.save(f"{OUT}/img/{m['id']}-{v}.webp", "WEBP", quality=82, method=5)
    m["w"], m["h"] = im.size
    sections[-1][1].append(m)

def pair(m):
    desk = m["viewport"]["width"] > 600
    cells = "".join(
        f'<figure><figcaption class="{v}">{"Before" if v == "before" else "After"}</figcaption>'
        f'<a href="/side-by-side/img/{m["id"]}-{v}.webp" target="_blank"><img src="/side-by-side/img/{m["id"]}-{v}.webp" width="{m["w"]//2}" height="{m["h"]//2}" loading="lazy" alt="{html.escape(title(m))}, {v}"></a></figure>'
        for v in ("before", "after"))
    return f'<article id="{m["id"]}" class="pair{" desk" if desk else ""}"><h3><a href="#{m["id"]}">{html.escape(title(m))}</a></h3><div class="row">{cells}</div></article>'

nav = "".join(f'<a href="#s-{s}">{s} <span>{len(items)}</span></a>' for s, items in sections)
body = "".join(
    f'<section id="s-{s}"><h2>{s}</h2><p class="note">{NOTES.get(s, "")}</p>{"".join(pair(m) for m in items)}</section>'
    for s, items in sections)
count = sum(len(i) for _, i in sections)

page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Cashu.me: before and after</title>
<style>
:root{{color-scheme:dark;--bg:#0e0e10;--panel:#17171a;--line:#2a2a2f;--text:#ededf0;--muted:#9a9aa3;--before:#ff9f43;--after:#3ddc97}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif}}
header{{padding:40px 24px 8px;max-width:1240px;margin:0 auto}}h1{{font-size:30px;margin:0 0 8px;letter-spacing:-.01em}}
.meta{{color:var(--muted);margin:0;max-width:760px}}.meta b{{color:var(--text);font-weight:600}}
.legend{{display:flex;gap:18px;margin:16px 0 0;flex-wrap:wrap}}.legend span{{display:inline-flex;align-items:center;gap:8px;color:var(--muted)}}
.legend i{{width:10px;height:10px;border-radius:50%;display:inline-block}}
nav{{position:sticky;top:0;z-index:5;background:rgba(14,14,16,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}}
nav div{{max-width:1240px;margin:0 auto;padding:10px 24px;display:flex;gap:6px;overflow-x:auto}}
nav a{{flex:none;color:var(--text);text-decoration:none;padding:6px 12px;border-radius:999px;background:var(--panel);font-size:13px}}
nav a span{{color:var(--muted)}}nav a:hover{{background:var(--line)}}
main{{max-width:1240px;margin:0 auto;padding:0 24px 80px}}
section{{padding-top:40px}}h2{{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 4px;scroll-margin-top:60px}}
.note{{color:var(--muted);margin:0 0 12px}}
.pair{{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px 20px;margin:0 0 18px;scroll-margin-top:64px}}
.pair h3{{margin:0 0 12px;font-size:16px;font-weight:600}}.pair h3 a{{color:inherit;text-decoration:none}}
.row{{display:grid;grid-template-columns:repeat(2,minmax(0,{390}px));gap:24px;justify-content:center}}
.desk .row{{grid-template-columns:repeat(2,minmax(0,1fr))}}
figure{{margin:0}}figcaption{{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 8px;display:flex;align-items:center;gap:8px}}
figcaption::before{{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}}
figcaption.before{{color:var(--before)}}figcaption.after{{color:var(--after)}}
img{{display:block;width:100%;height:auto;border-radius:12px;border:1px solid var(--line);background:#000}}
@media (max-width:640px){{.row{{gap:10px}}.pair{{padding:12px}}header{{padding-top:24px}}h1{{font-size:24px}}}}
</style></head><body>
<header><h1>Cashu.me: before and after</h1>
<p class="meta"><b>Before</b> is {html.escape(BEFORE)}. <b>After</b> is {html.escape(AFTER)}. Each pair is captured at the same size from the same seeded wallet on the <b>mint.minibits.cash/Bitcoin</b> mint, whose balance and history are seeded test data. The testnut section uses real test ecash from <b>testnut.cashu.space</b>. {count} screens. Click any image to open it at full resolution.</p>
<div class="legend"><span><i style="background:var(--before)"></i>Before (main)</span><span><i style="background:var(--after)"></i>After (this branch)</span></div></header>
<nav><div>{nav}</div></nav><main>{body}</main></body></html>"""
open(OUT + "/index.html", "w").write(page)
print(count, "pairs ->", os.path.abspath(OUT))
