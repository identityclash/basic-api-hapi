'use strict';

const validateHeaders = function(headers, cb) {
    let apiError = {
        error_code: 400,
        error_message: 'Invalid headers. Required device and version.'
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