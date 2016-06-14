'use strict';

const Lodash = require('lodash');

/**
 * Check request header that contains 'Token', 'Device', 'Version' for session
 * @param headers The request headers sent by client containing device and version.
 * @param cb The callback of where to pass err if no session found.
 */
const validateSession = function (server, headers, cb) {

    const headerValidator = server.methods.validationHeader;

    headerValidator.validateHeaders(headers, (err) => {

        if (err) {
            return cb(err);
        }
        else {
            const apiError = {
                errorCode: 401,
                errorMessage: 'Unauthorized access.'
            };

            const headerSession = headers.token;

            if (Lodash.isEmpty(headerSession)) {
                return cb(apiError);
            }
            else {
                server.methods.dbQuery.getUserSession(headerSession, null, (err, obj) => {

                    if (Lodash.isEmpty(err) && !Lodash.isEmpty(obj)) {
                        server.methods.dbQuery.refreshSessionExpiry(headerSession, (err, obj) => {

                            cb(err);
                        });
                    }
                    else {
                        cb(apiError);
                    }
                });
            }
        }
    });
};

module.exports = {
    validateSession: validateSession
};
