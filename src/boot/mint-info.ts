export async function verifyMint(url: string): Promise<boolean> {
  try {
    const resp = await fetch(`${url}/v1/info`);
    const info = await resp.json();
    const nuts = info?.nuts || {};
    return (
      nuts["10"]?.supported === true &&
      nuts["11"]?.supported === true &&
      nuts["14"]?.supported === true
    );
  } catch {
    return false;
  }
}
