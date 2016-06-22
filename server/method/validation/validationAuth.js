'use strict';

const Lodash = require('lodash');

/**
 * Check request header that contains 'Token', 'Device', 'Version' for session
 * @param headers The request headers sent by client containing device and version.
 * @param cb The callback of where to pass err if no session found, else pass obj as object of returned
 * 'session:{sessiontoken}' in database which contains the entityId, email, device, version.
 */
const validateSession = function (server, headers, cb) {

    const headerValidator = server.methods.validationHeader;

    headerValidator.validateHeaders(headers, (err) => {

        if (err) {
            return cb(err, null);
        }
        else {
            const apiError = {
                errorCode: 401,
                errorMessage: 'Unauthorized access.'
            };

            const headerSession = headers.token;

            if (Lodash.isEmpty(headerSession)) {
                return cb(apiError, null);
            }
            else {
                server.methods.dbQuery.getUserSession(headerSession, null, (err, obj) => {

                    const sessionDetails = obj;

                    if (!Lodash.isEmpty(obj)) {
                        server.methods.dbQuery.refreshSessionExpiry(headerSession, (err, obj) => {

                            cb(err, sessionDetails);
                        });
                    }
                    else {
                        cb(apiError, null);
                    }
                });
            }
        }
    });
};

module.exports = {
    validateSession: validateSession
};
