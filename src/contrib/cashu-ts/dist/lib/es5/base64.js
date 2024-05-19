"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64ToJson = exports.encodeJsonToBase64 = exports.encodeBase64toUint8 = exports.encodeUint8toBase64 = void 0;
var buffer_1 = require("buffer/");
function encodeUint8toBase64(uint8array) {
    return buffer_1.Buffer.from(uint8array).toString('base64');
}
exports.encodeUint8toBase64 = encodeUint8toBase64;
function encodeBase64toUint8(base64String) {
    return buffer_1.Buffer.from(base64String, 'base64');
}
exports.encodeBase64toUint8 = encodeBase64toUint8;
function encodeJsonToBase64(jsonObj) {
    var jsonString = JSON.stringify(jsonObj);
    return base64urlFromBase64(buffer_1.Buffer.from(jsonString).toString('base64'));
}
exports.encodeJsonToBase64 = encodeJsonToBase64;
function encodeBase64ToJson(base64String) {
    var jsonString = buffer_1.Buffer.from(base64urlToBase64(base64String), 'base64').toString();
    var jsonObj = JSON.parse(jsonString);
    return jsonObj;
}
exports.encodeBase64ToJson = encodeBase64ToJson;
function base64urlToBase64(str) {
    return str.replace(/-/g, '+').replace(/_/g, '/');
}
function base64urlFromBase64(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').split('=')[0];
}
