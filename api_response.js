'use strict';

// create JSON String of API response which contains a status and message
const apiResponse = function (status, message, cb) {
    let apiResponse = {
        status: status,
        message: message
    }
    return JSON.stringify(apiResponse);
};

module.exports = {
    constructApiResponse: apiResponse
};