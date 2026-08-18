#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../.."
);
const testResultsDirectory = resolve(repositoryRoot, "test-results");
const renderingAssetsDirectory = resolve(
  repositoryRoot,
  "artifacts/e2e-video-assets"
);
const defaultOutput = resolve(repositoryRoot, "artifacts/wallet-e2e-demo.mp4");
const selectedSpecs = ["mint.spec.ts", "melt.spec.ts", "ecash.spec.ts"];

function printHelp() {
  console.log(`Usage: node .agents/skills/e2e-test-playwright-video/scripts/render.mjs [options]

Options:
  --skip-tests       Reuse the current recordings in test-results
  --speed <number>   Playback speed for browser footage (default: 1.25)
  --output <path>    MP4 destination (default: artifacts/wallet-e2e-demo.mp4)
  --help             Show this help`);
}

function parseArguments(argumentsToParse) {
  const options = {
    runTests: true,
    speed: 1.25,
    output: defaultOutput,
  };

  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];
    if (argument === "--skip-tests") {
      options.runTests = false;
    } else if (argument === "--help") {
      options.help = true;
    } else if (argument === "--speed") {
      options.speed = Number(argumentsToParse[++index]);
    } else if (argument.startsWith("--speed=")) {
      options.speed = Number(argument.slice("--speed=".length));
    } else if (argument === "--output") {
      options.output = resolve(repositoryRoot, argumentsToParse[++index]);
    } else if (argument.startsWith("--output=")) {
      options.output = resolve(
        repositoryRoot,
        argument.slice("--output=".length)
      );
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }

  if (
    !Number.isFinite(options.speed) ||
    options.speed < 0.5 ||
    options.speed > 4
  ) {
    throw new Error("--speed must be a number between 0.5 and 4");
  }
  if (extname(options.output).toLowerCase() !== ".mp4") {
    throw new Error("--output must use the .mp4 extension");
  }

  return options;
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const capture = Boolean(options.capture);
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: options.env ?? process.env,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";

    if (capture) {
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
    }

    child.once("error", rejectRun);
    child.once("exit", (code, signal) => {
      if (signal) {
        rejectRun(new Error(`${command} exited after ${signal}`));
      } else if (code !== 0) {
        rejectRun(
          new Error(
            `${command} exited with code ${code}${stderr ? `\n${stderr}` : ""}`
          )
        );
      } else {
        resolveRun({ stdout, stderr });
      }
    });
  });
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    })
  );
  return nestedFiles.flat();
}

async function locateRecordings() {
  const files = await listFiles(testResultsDirectory);
  const relativePath = (file) => relative(testResultsDirectory, file);
  const incoming = files.find((file) =>
    /^mint-[^/]+\/video\.webm$/.test(relativePath(file))
  );
  const outgoing = files.find((file) =>
    /^melt-[^/]+\/video\.webm$/.test(relativePath(file))
  );
  const sender = resolve(testResultsDirectory, "ecash-video/sender.webm");
  const receiver = resolve(testResultsDirectory, "ecash-video/receiver.webm");

  for (const [name, file] of Object.entries({
    incoming,
    outgoing,
    sender,
    receiver,
  })) {
    if (!file) {
      throw new Error(`Missing ${name} browser recording in test-results`);
    }
    await stat(file).catch(() => {
      throw new Error(
        `Missing ${name} browser recording at ${relative(repositoryRoot, file)}`
      );
    });
  }

  return { incoming, outgoing, sender, receiver };
}

function pageShell(body, extraStyles = "") {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      html, body { width: 1280px; height: 720px; margin: 0; overflow: hidden; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      ${extraStyles}
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

async function renderCards(paths) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  try {
    await page.setContent(
      pageShell(
        `<main class="frame">
          <div class="accent"></div>
          <div class="brand">CASHU.ME</div>
          <h1>Wallet E2E Test Run</h1>
          <p>real browser&nbsp;&nbsp;•&nbsp;&nbsp;real CDK mint&nbsp;&nbsp;•&nbsp;&nbsp;fake rails</p>
          <footer>BOLT11&nbsp;&nbsp;&nbsp; BOLT12&nbsp;&nbsp;&nbsp; ON-CHAIN&nbsp;&nbsp;&nbsp; ECASH</footer>
        </main>`,
        `body { background: linear-gradient(180deg, #08090d, #0d1416); color: white; display: grid; place-items: center; }
        .frame { width: 1060px; height: 536px; border: 2px solid #242933; border-radius: 44px; background: #101218; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .accent { width: 176px; height: 12px; border-radius: 8px; background: #63e6a6; margin-bottom: 70px; }
        .brand { color: #63e6a6; font-size: 34px; font-weight: 700; letter-spacing: 2px; }
        h1 { font-size: 58px; margin: 28px 0 18px; letter-spacing: -1px; }
        p { color: #aeb7c4; font-size: 26px; margin: 0; }
        footer { color: #737e8d; font-size: 20px; margin-top: 72px; letter-spacing: 1px; }`
      )
    );
    await page.screenshot({ path: paths.title });

    const renderChapter = async (path, title, subtitle, accent) => {
      await page.setContent(
        pageShell(
          `<section class="card" style="--accent:${accent}">
            <div class="line"></div>
            <div><h2>${title}</h2><p>${subtitle}</p></div>
          </section>`,
          `body { background: transparent; color: white; }
          .card { position: absolute; top: 30px; left: 34px; width: 566px; height: 96px; border: 2px solid var(--accent); border-radius: 20px; background: rgba(8, 9, 13, .9); display: flex; align-items: center; padding: 18px; }
          .line { width: 8px; height: 56px; border-radius: 5px; background: var(--accent); margin-right: 20px; }
          h2 { font-size: 27px; margin: 0 0 7px; }
          p { color: #b9c2ce; font-size: 18px; margin: 0; }`
        )
      );
      await page.screenshot({ path, omitBackground: true });
    };

    await renderChapter(
      paths.incoming,
      "INCOMING PAYMENTS",
      "BOLT11  •  BOLT12  •  ON-CHAIN",
      "#63e6a6"
    );
    await renderChapter(
      paths.outgoing,
      "OUTGOING PAYMENTS",
      "BOLT11  •  BOLT12  •  ON-CHAIN",
      "#ffb45b"
    );

    await page.setContent(
      pageShell(
        `<header><h2>ECASH TRANSFER</h2><p>token send&nbsp;&nbsp;•&nbsp;&nbsp;receive&nbsp;&nbsp;•&nbsp;&nbsp;replay protection</p></header>
        <footer class="sender">SENDER&nbsp;&nbsp; 100 → 63 sats</footer>
        <footer class="receiver">RECEIVER&nbsp;&nbsp; 0 → 37 sats</footer>`,
        `body { background: transparent; color: white; }
        header { position: absolute; top: 26px; left: 34px; width: 1212px; height: 90px; border: 2px solid #8b7cff; border-radius: 20px; background: rgba(8, 9, 13, .92); text-align: center; padding: 15px; }
        header h2 { font-size: 27px; margin: 0 0 6px; }
        header p { color: #b9c2ce; font-size: 18px; margin: 0; }
        footer { position: absolute; bottom: 30px; width: 584px; height: 66px; border-radius: 16px; background: rgba(8, 9, 13, .92); display: grid; place-items: center; font-size: 23px; font-weight: 650; }
        .sender { left: 34px; color: #63e6a6; }
        .receiver { right: 34px; color: #8b7cff; }`
      )
    );
    await page.screenshot({ path: paths.ecash, omitBackground: true });
  } finally {
    await browser.close();
  }
}

function outputSibling(output, suffix) {
  const extension = extname(output);
  return `${output.slice(0, -extension.length)}${suffix}`;
}

async function probeVideo(ffprobe, path) {
  const result = await run(
    ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration,size:stream=codec_name,width,height,avg_frame_rate",
      "-of",
      "json",
      path,
    ],
    { capture: true }
  );
  return JSON.parse(result.stdout);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
  const ffprobe = process.env.FFPROBE ?? "ffprobe";
  await Promise.all([
    run(ffmpeg, ["-version"], { capture: true }),
    run(ffprobe, ["-version"], { capture: true }),
  ]);

  if (options.runTests) {
    await run("npm", ["run", "test:e2e", "--", ...selectedSpecs], {
      env: { ...process.env, E2E_VIDEO: "on" },
    });
  }

  const recordings = await locateRecordings();
  await mkdir(renderingAssetsDirectory, { recursive: true });
  await mkdir(dirname(options.output), { recursive: true });

  const cards = {
    title: resolve(renderingAssetsDirectory, "title.png"),
    incoming: resolve(renderingAssetsDirectory, "incoming.png"),
    outgoing: resolve(renderingAssetsDirectory, "outgoing.png"),
    ecash: resolve(renderingAssetsDirectory, "ecash.png"),
  };
  await renderCards(cards);

  const speed = options.speed.toFixed(3);
  const filter = [
    "[0:v]scale=1280:720,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[title]",
    `[1:v]setpts=PTS/${speed},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x08090d,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[mintbase]`,
    "[2:v]scale=1280:720,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[inov]",
    "[mintbase][inov]overlay=0:0:shortest=1,format=yuv420p[incoming]",
    `[3:v]setpts=PTS/${speed},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x08090d,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[meltbase]`,
    "[4:v]scale=1280:720,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[outov]",
    "[meltbase][outov]overlay=0:0:shortest=1,format=yuv420p[outgoing]",
    `[5:v]setpts=PTS/${speed},scale=640:360,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[left]`,
    `[6:v]setpts=PTS/${speed},scale=640:360,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[right]`,
    "[left][right]hstack=inputs=2:shortest=1,pad=1280:720:0:180:color=0x08090d[ecbase]",
    "[7:v]scale=1280:720,fps=30,format=rgba,settb=AVTB,setpts=PTS-STARTPTS[ecov]",
    "[ecbase][ecov]overlay=0:0:shortest=1,format=yuv420p[ecash]",
    "[title][incoming][outgoing][ecash]concat=n=4:v=1:a=0[out]",
  ].join(";");

  await run(ffmpeg, [
    "-y",
    "-loop",
    "1",
    "-framerate",
    "30",
    "-t",
    "3",
    "-i",
    cards.title,
    "-i",
    recordings.incoming,
    "-loop",
    "1",
    "-framerate",
    "30",
    "-t",
    "60",
    "-i",
    cards.incoming,
    "-i",
    recordings.outgoing,
    "-loop",
    "1",
    "-framerate",
    "30",
    "-t",
    "60",
    "-i",
    cards.outgoing,
    "-i",
    recordings.sender,
    "-i",
    recordings.receiver,
    "-loop",
    "1",
    "-framerate",
    "30",
    "-t",
    "60",
    "-i",
    cards.ecash,
    "-filter_complex",
    filter,
    "-map",
    "[out]",
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    "20",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    options.output,
  ]);

  const contactSheet = outputSibling(options.output, "-contact-sheet.png");
  await run(ffmpeg, [
    "-y",
    "-i",
    options.output,
    "-vf",
    "fps=1/8,scale=320:180,tile=5x1",
    "-frames:v",
    "1",
    "-update",
    "1",
    contactSheet,
  ]);

  const metadata = await probeVideo(ffprobe, options.output);
  const stream = metadata.streams[0];
  const duration = Number(metadata.format.duration).toFixed(1);
  const sizeMiB = (Number(metadata.format.size) / 1024 / 1024).toFixed(1);
  console.log(`\nVideo: ${relative(repositoryRoot, options.output)}`);
  console.log(`Contact sheet: ${relative(repositoryRoot, contactSheet)}`);
  console.log(
    `Validated: ${stream.codec_name}, ${stream.width}x${stream.height}, ${duration}s, ${sizeMiB} MiB`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
