import type { Page, Route } from "@playwright/test";

import type { PaymentMethod } from "./mint";

export type MintQuoteState = "UNPAID" | "PAID" | "ISSUED";
export type MeltQuoteState = "UNPAID" | "PENDING" | "PAID";

function withState(body: unknown, state: MintQuoteState | MeltQuoteState) {
  if (!body || typeof body !== "object") return body;

  const updated = body as Record<string, any>;
  if ("state" in updated) updated.state = state;
  if (updated.quote && typeof updated.quote === "object") {
    updated.quote.state = state;
  }
  return updated;
}

async function fulfillWithState(
  route: Route,
  state: MintQuoteState | MeltQuoteState
) {
  const response = await route.fetch();
  const body = withState(await response.json(), state);
  await route.fulfill({ response, json: body });
}

/** Force the quote checker to observe a deterministic mint state. */
export async function forceMintQuoteState(
  page: Page,
  mintUrl: string,
  method: PaymentMethod,
  state: MintQuoteState
) {
  await page.route(`${mintUrl}/v1/mint/quote/${method}/**`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await fulfillWithState(route, state);
  });
}

/** Force complete-melt and subsequent quote checks to report one state. */
export async function forceMeltQuoteState(
  page: Page,
  mintUrl: string,
  method: PaymentMethod,
  state: MeltQuoteState
) {
  await page.route(`${mintUrl}/v1/melt/${method}`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await fulfillWithState(route, state);
  });

  await page.route(`${mintUrl}/v1/melt/quote/${method}/**`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await fulfillWithState(route, state);
  });
}

/** Return a sequence of states for quote polling, retaining the last state. */
export async function forceMintQuoteStateSequence(
  page: Page,
  mintUrl: string,
  method: PaymentMethod,
  states: MintQuoteState[]
) {
  let index = 0;
  await page.route(`${mintUrl}/v1/mint/quote/${method}/**`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const state = states[Math.min(index++, states.length - 1)];
    await fulfillWithState(route, state);
  });
}
