'use strict';

const Bcryptjs = require('bcryptjs');
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

            cb(err);

        } else {

            const error = {
                errorCode: 401,
                errorMessage: 'Unauthorized access.'
            };

            const headerSession = headers.token;

            if (Lodash.isEmpty(headerSession)) {
                cb(error);
            } else {

                const token = headers.token;

                server.methods.dbQuery.getUserSession(token, null, (err, obj) => {
                    console.log('getUserSession', obj);
                    if (!Lodash.isEmpty(obj)) {

                        // Refresh session expiry if valid and existing

                        if (Lodash.isEqual(headerSession, token)) {
                            server.methods.dbQuery.refreshSessionExpiry(token, (err, obj) => {
                                cb(err);
                            });
                        } else {
                            cb(error);
                        }
                    } else {
                        cb(error);
                    }
                });
            }
        }
    });
};

/**
 * Check if User authentication is valid for login.
 * @param headers The request header object containing 'Device' and 'Version'.
 * @param payload The JSON String of credentials object. i.e
 * {
 *  'email':'dummy@gmail.com',
 *  'password':'P@ssw0rd!',
 *  'role': 'Admin'
 * }
 * @param cb The callback function when User object details has been checked.
 */
const validateAuth = function (server, headers, payload, cb) {
    let apiError = {
        errorCode: 400,
        errorMessage: 'Invalid login'
    };

    // Credentials contains "email","password","role"
    let credentials = JSON.parse(payload);

    const headerValidator = server.methods.validationHeader;

    headerValidator.validateHeaders(headers, (err) => {

        if (err) {
            cb(err, payload);
        } else {
            if (!payload) {
                cb(apiError, payload);
            } else {

                const device = headers.device;
                const version = headers.version;
                const token = headers.token;

                let passwordChecked = function () {
                    server.methods.dbQuery.getUserSession(token, credentials.email, (err, obj) => {
                        if (!Lodash.isEmpty(obj)) {
                            let session = obj.toString();
                            // Refresh session expiry if existing
                            server.methods.dbQuery.refreshSessionExpiry(session, (err, obj) => {
                                cb(err, session);
                            });
                        } else {
                            // Create session if no existing
                            server.methods.dbQuery.createUserSession(device, version, credentials.email, (err, obj) => {
                                cb(err, obj);
                            });
                        }
                    });
                };

                server.methods.dbQuery.getUserDetails(credentials.email, (err, obj) => {
                    if (Lodash.isEmpty(obj)) {
                        cb(apiError, payload);
                    } else {
                        let hashPwd = obj.password;
                        Bcryptjs.compare(credentials.password, hashPwd, (err, res) => {
                            if (err || res === false) {
                                // Password did not matched, throw err
                                cb(apiError, payload);
                            } else {
                                // Password matched
                                passwordChecked();
                            }
                        });
                    }
                });
            }
        }
    });
};

module.exports = {
    validateSession: validateSession,
    validateAuth: validateAuth
};
