'use strict';

const validateHeaders = function(headers, cb) {
    let apiError = {
        error_code: 400,
        error_message: 'Invalid headers. Required device and version.'
    };
    
    if (!headers || headers == null || headers == undefined) {
        cb(apiError);
    } else {
        if (headers.goclassdevice == undefined || headers.goclassversion == undefined ||
                headers.goclassdevice == null || headers.goclassversion == null ||
                !headers.goclassdevice || !headers.goclassversion) {
            cb(apiError);
        } else {
            cb(null);
        }
    }
};

module.exports = {
    validateHeaders : validateHeaders
};