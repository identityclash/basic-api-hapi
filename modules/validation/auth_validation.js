'use strict';

const Bcryptjs = require('bcryptjs');

const headerValidation = require('./header_validation');
const utils = require('../../utility/util');

/**
 * Check request header that contains 'GoClassToken', 'GoClassDevice', 'GoClassVersion' for session
 * @param userEmail The User email of Client.
 * @param headers The request headers sent by client containing device and version.
 * @param cb The callback of where to pass err if no session found.
 */
const validateSession = function (server, headers, cb) {
    let err = {
        error_code: 401,
        error_message: 'Unauthorized access.'
    };
    
    headerValidation.validateHeaders(headers, function(err) {
        if (err) {
            cb(err);// no headers of 'GoClassDevice' && 'GoClassVersion'
        } else {
            const headerSession = headers.goclasstoken;
            
            if (!headerSession) {
                cb(err);// session empty details empty
                
            } else {
                server.methods.db.getUserSession(headers, null, function (err, reply) {
                    if (err || reply == null || reply == undefined) {
                        cb(err);
                    } else if (reply.toString()) {
                        let storedSession = reply.toString();
                        if (utils.compareStrings(headerSession, storedSession)) {
                            // refresh session expiry if valid and existing
                            server.methods.db.refreshSessionExpiry(reply.toString());
                            cb(null);
                        } else {
                            cb(err);
                        }
                    }
                });
                
            }
        }
    });
};

/**
 * Check if User authentication is valid for login.
 * @param headers The request header object containing 'GoClassDevice' and 'GoClassVersion'.
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
        error_code: 400,
        error_message: 'Invalid login'
    };

    // credentials contains "email","password","role"
    let credentials = JSON.parse(payload);

    headerValidation.validateHeaders(headers, function(err) {
        if (err) {
            cb(err, payload);// no headers of 'GoClassDevice' && 'GoClassVersion'
        } else {
            if (!payload) {
                cb(apiError, payload);// credentials details empty
            } else {
                let passwordChecked = function() {
                    let session = '';
                    server.methods.db.getUserSession(headers, credentials.email, function (err, reply) {
                        if (err || reply == null || reply == undefined) {
                            // create session if no existing
                            session = server.methods.db.createUserSession(headers, credentials.email);
                            cb(null, session);
                        } else if (reply.toString()) {
                            session = reply.toString();
                            // refresh session expiry if existing
                            server.methods.db.refreshSessionExpiry(session);
                            cb(null, session);
                        }
                    });
                };
                
                server.methods.db.getUserDetails(credentials.email, function (err, obj) {
                    if (err) {
                        cb(apiError, payload);    
                    } else if (obj == null) {
                        cb(apiError, payload);
                    } else {
                        let hashPwd = obj.password;
                        Bcryptjs.compare(credentials.password, hashPwd, function(err, res) {
                            if (err || res == false) {
                                // password did not matched, throw err
                                cb(apiError, payload);
                            } else {
                                // password matched
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