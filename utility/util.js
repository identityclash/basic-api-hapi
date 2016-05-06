'user strict';

const CryptoJS = require('crypto-js');// session creation

const compareStrings = function strcmp(a, b) {
    a = a.toString(), b = b.toString();
    for (var i=0,n=Math.max(a.length, b.length); i<n && a.charAt(i) === b.charAt(i); ++i);
    if (i === n) return 0;
    return a.charAt(i) > b.charAt(i) ? -1 : 1;
};

const base64Encrypt = function base64Encrypt(rawStr) {
    var wordArray = CryptoJS.enc.Utf8.parse(rawStr);
    var base64 = CryptoJS.enc.Base64.stringify(wordArray);
    
    return base64;
};

const base64Decrypt = function base64Decrypt(base64) {
    var parsedWordArray = CryptoJS.enc.Base64.parse(base64);
    var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
    
    return parsedStr;
};

const hmacMd5Encrypt = function hmacMd5Encrypt(rawStr) {
    var hash = CryptoJS.HmacMD5(rawStr, 'goclass-api-v1');
    return hash.toString();
};

const aesEncrypt = function aesEncrypt(rawStr) {
    var hash = CryptoJS.AES.encrypt(JSON.stringify(sessionData), 'goclass-api-v1');
    return hash;
};

const aesDecrypt = function aesDecrypt(aes) {
    var bytes = CryptoJS.AES.decrypt(aes, 'secret key 123');
    var rawStr = bytes.toString(CryptoJS.enc.Utf8);
    return rawStr;
};

module.exports = {
    compareStrings: compareStrings,
    base64Encrypt: base64Encrypt,
    base64Decrypt: base64Decrypt,
    hmacMd5Encrypt: hmacMd5Encrypt,
    aesEncrypt: aesEncrypt,
    aesDecrypt: aesDecrypt
};