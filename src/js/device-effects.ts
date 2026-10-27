// Backdrop blur is cheap on current GPUs but makes sheets stutter on low-end Android and old
// iPhones. Browsers without backdrop-filter skip it in CSS (@supports); this flags the devices
// that support it but can't afford it, so they keep the plain dimmed scrim.

export const REDUCED_EFFECTS_CLASS = "reduced-effects";

type DeviceHints = {
  userAgent: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
};

function majorVersion(userAgent: string, pattern: RegExp): number | null {
  const match = userAgent.match(pattern);
  return match ? parseInt(match[1], 10) : null;
}

export function shouldReduceEffects(hints: DeviceHints): boolean {
  if (hints.deviceMemory !== undefined && hints.deviceMemory <= 2) return true;
  if (hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 2)
    return true;
  // Chrome now reports Android 10 for every newer release, so only older versions show here.
  const android = majorVersion(hints.userAgent, /Android (\d+)/);
  if (android !== null && android < 9) return true;
  // iPhone and iPad OS versions before 15 run on the oldest supported hardware.
  const ios = majorVersion(hints.userAgent, /(?:iPhone|iPad|iPod).* OS (\d+)_/);
  if (ios !== null && ios < 15) return true;
  return false;
}

export function applyDeviceEffects(): void {
  if (typeof navigator === "undefined" || typeof document === "undefined")
    return;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const reduce = shouldReduceEffects({
    userAgent: nav.userAgent,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  });
  document.documentElement.classList.toggle(REDUCED_EFFECTS_CLASS, reduce);
}
