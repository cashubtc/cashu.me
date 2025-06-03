export function unescapeBase64Url(str: string): string {
  return (str + "===".slice((str.length + 3) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
}

export function escapeBase64Url(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const fromCharCode = String.fromCharCode;

const encode = (uint8array: Uint8Array): string => {
  const output: string[] = [];
  for (let i = 0, length = uint8array.length; i < length; i++) {
    output.push(fromCharCode(uint8array[i]));
  }
  return btoa(output.join(""));
};

const asCharCode = (c: string): number => c.charCodeAt(0);

const decode = (chars: string): Uint8Array => {
  return Uint8Array.from(atob(chars), asCharCode);
};

export const uint8ToBase64 = {
  encode,
  decode,
};
