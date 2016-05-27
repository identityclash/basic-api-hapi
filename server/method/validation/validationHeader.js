'use strict';

const validateHeaders = function (headers, cb) {
    let apiError = {
        errorCode: 400,
        errorMessage: 'Invalid headers. Required device and version.'
    };
    if (!headers || headers == null || headers == undefined) {
        cb(apiError);
    } else {
        if (headers.device == undefined || headers.version == undefined ||
            headers.device == null || headers.version == null ||
            !headers.device || !headers.version) {
            cb(apiError);
        } else {
            cb(null);
        }
    }
};

module.exports = {
    validateHeaders: validateHeaders
};
