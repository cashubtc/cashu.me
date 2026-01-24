function unescapeBase64Url(str) {
  return (str + "===".slice((str.length + 3) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
}

function escapeBase64Url(str) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const uint8ToBase64 = (function (exports) {
  "use strict";

  const encode = function encode(uint8array) {
    const output = [];

    for (let i = 0; i < uint8array.length; i++) {
      output.push(String.fromCharCode(uint8array[i]));
    }

    return btoa(output.join(""));
  };

  const asCharCode = function asCharCode(c) {
    return c.charCodeAt(0);
  };

  const decode = function decode(chars) {
    return Uint8Array.from(atob(chars), asCharCode);
  };

  exports.decode = decode;
  exports.encode = encode;

  return exports;
})({});

export { uint8ToBase64 };
