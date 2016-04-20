'use strict';

const Boom = require('boom');

/**
 * Create API response which contains a API status code and message.
 * @param httpStatus The standard http status code. i.e 400
 * @param apiStatusCode The API status code.
 * @param msg The API response message of status code.
 */ 
const constructApiResponse = function (httpStatus, apiStatusCode, msg) {
    let response = {
        'statusCode': httpStatus,
        'message': msg
    }
    return response;
};

/**
 * Create API error response which contains a API status code and message.
 * @param httpStatus The standard http status code. i.e 400
 * @param apiStatusCode The API status code.
 * @param msg The API response message of status code.
 */ 
const constructApiErrorResponse = function (httpStatus, apiStatusCode, msg) {
    var error = Boom.create(httpStatus, msg, { timestamp: Date.now() });
    error.output.payload.statusCode = apiStatusCode;
    error.output.payload.message = msg;
    return error;
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
    constructApiErrorResponse: constructApiErrorResponse,
    getUnexpectedApiError: getUnexpectedApiError,
    getUserNonExistentError: getUserNonExistentError
};