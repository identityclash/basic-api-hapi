'use strict';

const Lodash = require('lodash');

const validateHeaders = function (headers, cb) {
    const apiError = {
        errorCode: 400,
        errorMessage: 'Invalid headers. Required device and version.'
    };
    if (!headers || Lodash.isEmpty(headers)) {
        return cb(apiError);
    }
    else if (Lodash.isEmpty(headers.device) || Lodash.isEmpty(headers.version)) {
        return cb(apiError);
    }

    return cb(null);
};

module.exports = {
    validateHeaders: validateHeaders
};
