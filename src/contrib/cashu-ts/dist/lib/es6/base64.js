import { Buffer } from 'buffer/';
function encodeUint8toBase64(uint8array) {
    return Buffer.from(uint8array).toString('base64');
}
function encodeBase64toUint8(base64String) {
    return Buffer.from(base64String, 'base64');
}
function encodeJsonToBase64(jsonObj) {
    var jsonString = JSON.stringify(jsonObj);
    return base64urlFromBase64(Buffer.from(jsonString).toString('base64'));
}
function encodeBase64ToJson(base64String) {
    var jsonString = Buffer.from(base64urlToBase64(base64String), 'base64').toString();
    var jsonObj = JSON.parse(jsonString);
    return jsonObj;
}
function base64urlToBase64(str) {
    return str.replace(/-/g, '+').replace(/_/g, '/');
}
function base64urlFromBase64(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').split('=')[0];
}
export { encodeUint8toBase64, encodeBase64toUint8, encodeJsonToBase64, encodeBase64ToJson };
//# sourceMappingURL=base64.js.map