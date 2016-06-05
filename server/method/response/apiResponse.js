'use strict';

const Boom = require('boom');

/**
 * Create API response which contains a API status code and message.
 * @param httpStatus The standard http status code. i.e 400
 * @param apiStatusCode The API status code.
 * @param msg The API response message of status code.
 */
const constructApiResponse = function (httpStatus, apiStatusCode, msg) {
    const response = {
        statusCode: httpStatus,
        message: msg
    };
    return response;
};

/**
 * Create API error response which contains a API status code and message.
 * @param httpStatus The standard http status code. i.e 400
 * @param apiStatusCode The API status code.
 * @param msg The API response message of status code.
 */
const constructApiErrorResponse = function (httpStatus, apiStatusCode, msg) {
    const error = Boom.create(httpStatus, msg, { timestamp: Date.now() });
    error.output.payload.statusCode = apiStatusCode;
    error.output.payload.message = msg;
    return error;
};

/**
 * Create API response which will be thrown if unexpected
 * error occured in API calls of client.
 */
const getUnexpectedApiError = function () {
    const msg = 'Unexpected API error.';
    const error = Boom.badRequest(msg);
    error.output.payload.message = msg;
    return error;
};

// Create API response when get User details is not found.
const getUserNonExistentError = function () {
    const msg = 'User non-existent.';
    const error = Boom.notFound(msg);
    error.output.payload.message = msg;
    return error;
};

const getEmailAlreadyExistError = function () {
    const msg = 'Email already taken.';
    const error = Boom.badRequest(msg);
    error.output.payload.message = msg;
    return error;
};

module.exports = {
    constructApiResponse: constructApiResponse,
    constructApiErrorResponse: constructApiErrorResponse,
    getUnexpectedApiError: getUnexpectedApiError,
    getUserNonExistentError: getUserNonExistentError,
    getEmailAlreadyExistError: getEmailAlreadyExistError
};
