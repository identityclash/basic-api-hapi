'user strict';

const CryptoJS = require('crypto-js');

const hmacMd5Encrypt = function (rawStr) {
    const hash = CryptoJS.HmacMD5(rawStr, 'testkey-api-v1');
    return hash.toString();
};

module.exports = {
    hmacMd5Encrypt: hmacMd5Encrypt
};
