import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "src/stores/ui";
import { WALLET_MUTEX_NAME } from "src/js/walletMutex";

const originalLocks = Object.getOwnPropertyDescriptor(navigator, "locks");

function setLocks(locks) {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: locks,
  });
}

function createWebLocks() {
  let tail = Promise.resolve();
  return {
    request: vi.fn((name, options, callback) => {
      const request = tail.then(() => callback({ name, mode: options.mode }));
      tail = request.catch(() => {});
      return request;
    }),
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => setLocks(undefined));

afterEach(async () => {
  await useUiStore().unlockMutex();
  if (originalLocks) {
    Object.defineProperty(navigator, "locks", originalLocks);
  } else {
    delete navigator.locks;
  }
});

describe("ui store", () => {
  it("formats custom Cashu units without throwing", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(12, "unit")).toBe("12 unit");
  });

  it("keeps cent-based fiat formatting", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(1234, "usd")).toContain("12.34");
  });

  it("formats large metadata limits without losing cents", () => {
    expect(
      useUiStore().formatCurrency(18446744073709551615n, "usd", true)
    ).toBe("$184,467,440,737,095,516.15");
  });
});

describe.each(["in-memory", "Web Locks"])("%s wallet mutex", (backend) => {
  let locks;

  beforeEach(() => {
    locks = createWebLocks();
    if (backend === "Web Locks") setLocks(locks);
  });

  it("serializes callers until the current holder unlocks", async () => {
    const ui = useUiStore();
    let entered = false;

    await ui.lockMutex();
    const next = ui.lockMutex().then(() => {
      entered = true;
    });
    await Promise.resolve();

    expect(ui.globalMutexLock).toBe(true);
    expect(entered).toBe(false);
    await ui.unlockMutex();
    await next;
    expect(entered).toBe(true);
    expect(ui.globalMutexLock).toBe(true);
    await ui.unlockMutex();
    expect(ui.globalMutexLock).toBe(false);

    if (backend === "Web Locks") {
      expect(locks.request).toHaveBeenCalledTimes(2);
      expect(locks.request).toHaveBeenCalledWith(
        WALLET_MUTEX_NAME,
        { mode: "exclusive" },
        expect.any(Function)
      );
    } else {
      expect(locks.request).not.toHaveBeenCalled();
    }
  });

  it("supports reacquiring immediately after an unawaited unlock", async () => {
    const ui = useUiStore();
    await ui.lockMutex();

    const released = ui.unlockMutex();
    await ui.lockMutex();
    await released;

    expect(ui.globalMutexLock).toBe(true);
    await ui.unlockMutex();
    expect(ui.globalMutexLock).toBe(false);
  });

  it("runs a queued foreground payment before background work", async () => {
    const ui = useUiStore();
    const order = [];

    await ui.lockMutex();
    const background = ui
      .lockMutex("background")
      .then(() => order.push("background"));

    ui.beginForegroundPayment();
    const foreground = ui
      .lockMutex("foreground")
      .then(() => order.push("foreground"));

    await ui.unlockMutex();
    await foreground;

    expect(order).toEqual(["foreground"]);

    await ui.unlockMutex();
    ui.endForegroundPayment();
    await background;

    expect(order).toEqual(["foreground", "background"]);
    await ui.unlockMutex();
  });

  it("keeps background work out of the gap between foreground mutex sections", async () => {
    const ui = useUiStore();
    const order = [];

    ui.beginForegroundPayment();
    await ui.lockMutex("foreground");
    const background = ui
      .lockMutex("background")
      .then(() => order.push("background"));

    await ui.unlockMutex();
    expect(order).toEqual([]);
    expect(ui.globalMutexLock).toBe(false);

    await ui.lockMutex("foreground");
    order.push("foreground");
    await ui.unlockMutex();
    ui.endForegroundPayment();
    await background;

    expect(order).toEqual(["foreground", "background"]);
    await ui.unlockMutex();
  });

  it("preserves normal priority and FIFO order within the same priority", async () => {
    const ui = useUiStore();
    const order = [];
    await ui.lockMutex();
    const background = ui.lockMutex("background").then(() => order.push("bg"));
    const normal = ui.lockMutex().then(() => order.push("normal"));
    const nextNormal = ui.lockMutex().then(() => order.push("next normal"));

    await ui.unlockMutex();
    await normal;
    expect(order).toEqual(["normal"]);
    await ui.unlockMutex();
    await nextNormal;
    expect(order).toEqual(["normal", "next normal"]);
    await ui.unlockMutex();
    await background;
    expect(order).toEqual(["normal", "next normal", "bg"]);
    await ui.unlockMutex();
  });
});

describe("native wallet mutex acquisition", () => {
  let locks;

  beforeEach(() => {
    locks = createWebLocks();
    setLocks(locks);
  });

  it("waits for the browser to grant the lock", async () => {
    const grant = deferred();
    const request = locks.request.getMockImplementation();
    locks.request.mockImplementationOnce((...args) =>
      grant.promise.then(() => request(...args))
    );
    const ui = useUiStore();
    let acquired = false;
    const acquisition = ui.lockMutex().then(() => {
      acquired = true;
    });

    await Promise.resolve();
    expect(acquired).toBe(false);
    expect(ui.globalMutexLock).toBe(true);
    grant.resolve();
    await acquisition;
    expect(acquired).toBe(true);
  });

  it("waits for native release before dispatching another caller", async () => {
    const released = deferred();
    const callbackFinished = deferred();
    const request = locks.request.getMockImplementation();
    locks.request.mockImplementationOnce((...args) =>
      request(...args).then(() => {
        callbackFinished.resolve();
        return released.promise;
      })
    );
    const ui = useUiStore();
    await ui.lockMutex();
    const next = ui.lockMutex();
    const releasing = ui.unlockMutex();
    await callbackFinished.promise;

    expect(ui.globalMutexLock).toBe(true);
    expect(locks.request).toHaveBeenCalledTimes(1);
    released.resolve();
    await releasing;
    await next;
    expect(locks.request).toHaveBeenCalledTimes(2);
  });

  it.each(["rejection", "throw"])(
    "rejects acquisition after a native %s and continues the queue",
    async (failure) => {
      const error = new Error("Lock acquisition failed");
      locks.request.mockImplementationOnce(() => {
        if (failure === "throw") throw error;
        return Promise.reject(error);
      });
      const ui = useUiStore();
      const failed = expect(ui.lockMutex()).rejects.toBe(error);
      const next = ui.lockMutex();

      await failed;
      await next;
      expect(locks.request).toHaveBeenCalledTimes(2);
      await ui.unlockMutex();
      expect(ui.globalMutexLock).toBe(false);
    }
  );

  it("does not let repeated unlocks clear the next holder", async () => {
    const ui = useUiStore();
    await ui.lockMutex();
    const next = ui.lockMutex();
    await Promise.all([ui.unlockMutex(), ui.unlockMutex()]);
    await next;

    let entered = false;
    const third = ui.lockMutex().then(() => {
      entered = true;
    });
    await Promise.resolve();
    expect(ui.globalMutexLock).toBe(true);
    expect(entered).toBe(false);
    expect(locks.request).toHaveBeenCalledTimes(2);

    await ui.unlockMutex();
    await third;
  });
});
