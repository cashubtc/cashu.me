// Gives an embedded copy of the app its own storage, so the comparison deck's demo wallet
// never reads or writes the wallet a person keeps on this origin. Loaded first in <head>.
// The "before" build (served under /side-by-side/before/) is always namespaced; the app at
// "/" only when the deck frames it (window.name "sbs-after").
(function () {
  const before = location.pathname.indexOf("/side-by-side/before") === 0;
  const P = before
    ? "sbs-before:"
    : window.name === "sbs-after"
    ? "sbs-after:"
    : "";
  if (!P) return;

  function namespaced(store) {
    function keys() {
      const out = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k.indexOf(P) === 0) out.push(k.slice(P.length));
      }
      return out;
    }
    const api = {
      getItem: function (k) {
        return store.getItem(P + k);
      },
      setItem: function (k, v) {
        store.setItem(P + k, String(v));
      },
      removeItem: function (k) {
        store.removeItem(P + k);
      },
      clear: function () {
        keys().forEach(function (k) {
          store.removeItem(P + k);
        });
      },
      key: function (i) {
        const k = keys()[i];
        return k === undefined ? null : k;
      },
    };
    // A proxy, so enumeration (JSON.stringify(localStorage), Object.keys) sees only this
    // namespace's keys, as the app's backup export expects.
    return new Proxy(api, {
      get: function (t, prop) {
        if (prop === "length") return keys().length;
        if (prop in t) return t[prop];
        if (typeof prop !== "string") return undefined;
        const v = store.getItem(P + prop);
        return v === null ? undefined : v;
      },
      set: function (t, prop, v) {
        store.setItem(P + String(prop), String(v));
        return true;
      },
      deleteProperty: function (t, prop) {
        store.removeItem(P + String(prop));
        return true;
      },
      has: function (t, prop) {
        return prop in t || store.getItem(P + String(prop)) !== null;
      },
      ownKeys: function () {
        return keys();
      },
      getOwnPropertyDescriptor: function (t, prop) {
        const v = store.getItem(P + String(prop));
        if (v === null) return undefined;
        return {
          value: v,
          writable: true,
          enumerable: true,
          configurable: true,
        };
      },
    });
  }

  const local = namespaced(window.localStorage);
  const session = namespaced(window.sessionStorage);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: function () {
      return local;
    },
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    get: function () {
      return session;
    },
  });

  const F = window.IDBFactory && window.IDBFactory.prototype;
  if (F) {
    const open = F.open;
    const del = F.deleteDatabase;
    const list = F.databases;
    F.open = function (name, version) {
      return version === undefined
        ? open.call(this, P + name)
        : open.call(this, P + name, version);
    };
    F.deleteDatabase = function (name) {
      return del.call(this, P + name);
    };
    if (list) {
      F.databases = function () {
        return list.call(this).then(function (all) {
          return all
            .filter(function (d) {
              return d.name.indexOf(P) === 0;
            })
            .map(function (d) {
              return { name: d.name.slice(P.length), version: d.version };
            });
        });
      };
    }
  }

  const BC = window.BroadcastChannel;
  if (BC) {
    const Channel = function (name) {
      return new BC(P + name);
    };
    Channel.prototype = BC.prototype;
    window.BroadcastChannel = Channel;
  }

  window.__sbs = { prefix: P };
})();
