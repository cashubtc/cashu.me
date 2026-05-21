export type MempoolTxMetadata = {
  txid: string;
  amount?: number;
  confirmed: boolean;
  confirmations: number;
  confirmationThreshold: number;
  blockHeight?: number;
  blockTime?: number;
  url: string;
};

export type OnchainNetwork = "bitcoin" | "mutinynet";

export function normalizeBitcoinAddress(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.toLowerCase().startsWith("bitcoin:")) return trimmed;
  const withoutScheme = trimmed.replace(/^bitcoin:/i, "");
  return withoutScheme.split("?")[0];
}

export function onchainNetwork(address: string): OnchainNetwork {
  return normalizeBitcoinAddress(address).toLowerCase().startsWith("tb1")
    ? "mutinynet"
    : "bitcoin";
}

export function onchainNetworkDisplay(network?: string): string {
  return network === "mutinynet" ? "Mutinynet" : "Bitcoin";
}

function mempoolBaseForAddress(value: string): string | null {
  const address = normalizeBitcoinAddress(value);
  const lower = address.toLowerCase();
  if (lower.startsWith("bc1") || /^[13]/.test(address)) {
    return "https://mempool.space/api";
  }
  if (lower.startsWith("tb1")) {
    return "https://mutinynet.com/api";
  }
  if (/^[mn2]/.test(address)) {
    return "https://mempool.space/testnet/api";
  }
  return null;
}

function mempoolWebBase(apiBase: string): string {
  return apiBase.replace(/\/api$/, "");
}

async function fetchTipHeight(apiBase: string): Promise<number> {
  const response = await fetch(`${apiBase}/blocks/tip/height`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("could not fetch block height");
  return Number(await response.text());
}

async function fetchTipHeightSafe(apiBase: string): Promise<number | null> {
  try {
    return await fetchTipHeight(apiBase);
  } catch (error) {
    console.warn("could not fetch block height", error);
    return null;
  }
}

function txConfirmations(tx: any, tipHeight: number | null): number {
  if (!tx?.status?.confirmed || !tx.status.block_height) return 0;
  if (tipHeight === null) return 0;
  return Math.max(0, tipHeight - tx.status.block_height + 1);
}

function txConfirmed(
  tx: any,
  confirmations: number,
  confirmationThreshold: number
): boolean {
  if (!tx?.status?.confirmed) return false;
  if (confirmations <= 0) return true;
  return confirmations >= confirmationThreshold;
}

export async function fetchAddressTxMetadata(
  address: string,
  confirmationThreshold = 1
): Promise<MempoolTxMetadata | null> {
  const normalizedAddress = normalizeBitcoinAddress(address);
  const apiBase = mempoolBaseForAddress(normalizedAddress);
  if (!apiBase) return null;
  const txResponse = await fetch(
    `${apiBase}/address/${normalizedAddress}/txs`,
    {
      cache: "no-store",
    }
  );
  if (!txResponse.ok) throw new Error("could not fetch address transactions");
  const txs = await txResponse.json();
  const incoming = txs.find((tx: any) =>
    tx.vout?.some(
      (output: any) => output.scriptpubkey_address === normalizedAddress
    )
  );
  if (!incoming) return null;
  const amount = incoming.vout
    .filter((output: any) => output.scriptpubkey_address === normalizedAddress)
    .reduce((sum: number, output: any) => sum + Number(output.value || 0), 0);
  const tipHeight = await fetchTipHeightSafe(apiBase);
  const confirmations = txConfirmations(incoming, tipHeight);
  return {
    txid: incoming.txid,
    amount,
    confirmed: txConfirmed(incoming, confirmations, confirmationThreshold),
    confirmations,
    confirmationThreshold,
    blockHeight: incoming.status?.block_height,
    blockTime: incoming.status?.block_time,
    url: `${mempoolWebBase(apiBase)}/tx/${incoming.txid}`,
  };
}

export async function fetchTxMetadata(
  txid: string,
  confirmationThreshold = 1,
  addressHint?: string
): Promise<MempoolTxMetadata | null> {
  const apiBase = mempoolBaseForAddress(addressHint || "bc1");
  if (!apiBase) return null;
  const txResponse = await fetch(`${apiBase}/tx/${txid}`, {
    cache: "no-store",
  });
  if (!txResponse.ok) throw new Error("could not fetch transaction");
  const tx = await txResponse.json();
  const tipHeight = await fetchTipHeightSafe(apiBase);
  const confirmations = txConfirmations(tx, tipHeight);
  return {
    txid,
    confirmed: txConfirmed(tx, confirmations, confirmationThreshold),
    confirmations,
    confirmationThreshold,
    blockHeight: tx.status?.block_height,
    blockTime: tx.status?.block_time,
    url: `${mempoolWebBase(apiBase)}/tx/${txid}`,
  };
}
