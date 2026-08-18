import { spawn } from "node:child_process";

const composeFile = "test/e2e/docker-compose.yml";
const projectName = process.env.COMPOSE_PROJECT_NAME ?? "cashume-e2e";
const playwrightArgs = process.argv.slice(2);
let cleaningUp = false;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`${command} exited after ${signal}`));
      else resolve(code ?? 1);
    });
  });
}

const composeArgs = (...args) => [
  "compose",
  "--project-name",
  projectName,
  "--file",
  composeFile,
  ...args,
];

async function cleanup() {
  if (cleaningUp) return;
  cleaningUp = true;
  await run(
    "docker",
    composeArgs("down", "--volumes", "--remove-orphans")
  ).catch(() => {});
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await cleanup();
    process.kill(process.pid, signal);
  });
}

let exitCode = 1;
try {
  const stackCode = await run(
    "docker",
    composeArgs("up", "--detach", "--wait", "--wait-timeout", "120")
  );
  if (stackCode !== 0)
    throw new Error("The CDK test stack did not become ready");

  exitCode = await run("npx", ["playwright", "test", ...playwrightArgs], {
    env: {
      ...process.env,
      E2E_MINT_A_URL: "http://127.0.0.1:8085",
      E2E_MINT_B_URL: "http://127.0.0.1:8086",
      E2E_MINT_A_MANAGEMENT_URL: "http://127.0.0.1:10000",
    },
  });

  if (exitCode !== 0) {
    await run("docker", composeArgs("logs", "--no-color")).catch(() => {});
  }
} catch (error) {
  console.error(error);
  await run("docker", composeArgs("logs", "--no-color")).catch(() => {});
} finally {
  await cleanup();
}

process.exitCode = exitCode;
