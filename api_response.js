'use strict';

const Boom = require('boom');

/**
 * Create API response which contains a statusCode and message.
 * @param code The http status or API status code.
 * @param message The API response message of status code.
 */ 
const constructApiResponse = function (code, message) {
    let apiResponse = {
        code: code,
        message: message
    }
    return JSON.stringify(apiResponse);
};

/**
 * Create API response which will be thrown if unexpected
 * error occured in API calls of client.
 */
const getUnexpectedApiError = function () {
    let msg = 'Unexpected API error.';
    let error = Boom.badImplementation(msg);
    error.output.payload.message = msg;
    return error;
};

// Create API response when get User details is not found.
const getUserNonExistentError = function () {
    let msg = 'User non-existent.';
    let error = Boom.notFound(msg);
    error.output.payload.message = msg;
    return error;
};

module.exports = {
    constructApiResponse: constructApiResponse,
    getUnexpectedApiError: getUnexpectedApiError,
    getUserNonExistentError: getUserNonExistentError
};