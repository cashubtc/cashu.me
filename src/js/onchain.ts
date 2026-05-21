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

export function onchainNetwork(address: string): OnchainNetwork {
  return address.toLowerCase().startsWith("tb1") ? "mutinynet" : "bitcoin";
}

export function onchainNetworkDisplay(network?: string): string {
  return network === "mutinynet" ? "Mutinynet" : "Bitcoin";
}

function mempoolBaseForAddress(value: string): string | null {
  const lower = value.toLowerCase();
  if (lower.startsWith("bc1") || /^[13]/.test(value)) {
    return "https://mempool.space/api";
  }
  if (lower.startsWith("tb1")) {
    return "https://mutinynet.com/api";
  }
  if (/^[mn2]/.test(value)) {
    return "https://mempool.space/testnet/api";
  }
  return null;
}

function mempoolWebBase(apiBase: string): string {
  return apiBase.replace(/\/api$/, "");
}

async function fetchTipHeight(apiBase: string): Promise<number> {
  const response = await fetch(`${apiBase}/blocks/tip/height`);
  if (!response.ok) throw new Error("could not fetch block height");
  return Number(await response.text());
}

function txConfirmations(tx: any, tipHeight: number): number {
  if (!tx?.status?.confirmed || !tx.status.block_height) return 0;
  return Math.max(0, tipHeight - tx.status.block_height + 1);
}

export async function fetchAddressTxMetadata(
  address: string,
  confirmationThreshold = 1
): Promise<MempoolTxMetadata | null> {
  const apiBase = mempoolBaseForAddress(address);
  if (!apiBase) return null;
  const [tipHeight, txResponse] = await Promise.all([
    fetchTipHeight(apiBase),
    fetch(`${apiBase}/address/${address}/txs`),
  ]);
  if (!txResponse.ok) throw new Error("could not fetch address transactions");
  const txs = await txResponse.json();
  const incoming = txs.find((tx: any) =>
    tx.vout?.some((output: any) => output.scriptpubkey_address === address)
  );
  if (!incoming) return null;
  const amount = incoming.vout
    .filter((output: any) => output.scriptpubkey_address === address)
    .reduce((sum: number, output: any) => sum + Number(output.value || 0), 0);
  const confirmations = txConfirmations(incoming, tipHeight);
  return {
    txid: incoming.txid,
    amount,
    confirmed: confirmations >= confirmationThreshold,
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
  const [tipHeight, txResponse] = await Promise.all([
    fetchTipHeight(apiBase),
    fetch(`${apiBase}/tx/${txid}`),
  ]);
  if (!txResponse.ok) throw new Error("could not fetch transaction");
  const tx = await txResponse.json();
  const confirmations = txConfirmations(tx, tipHeight);
  return {
    txid,
    confirmed: confirmations >= confirmationThreshold,
    confirmations,
    confirmationThreshold,
    blockHeight: tx.status?.block_height,
    blockTime: tx.status?.block_time,
    url: `${mempoolWebBase(apiBase)}/tx/${txid}`,
  };
}
