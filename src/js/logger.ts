const isProd = process.env.NODE_ENV === "production";

export function debug(...args: any[]) {
  if (!isProd) {
    console.log(...args);
  }
}
