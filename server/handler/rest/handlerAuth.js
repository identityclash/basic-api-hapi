'use strict';

const Bcryptjs = require('bcryptjs');
const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;

        // Credentials contains "email","password","role"
        const credentials = request.payload;

        const apiError = {
            errorCode: 400,
            errorMessage: 'Invalid login'
        };

        const errLogin = apiResponse.constructApiErrorResponse(400, apiError.errorCode, apiError.errorMessage);

        function evaluateResult (err, result) {
            if (!Lodash.isEmpty(err)) {
                if (err.errorCode && err.errorMessage) {
                    const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                    server.log('error', '/auth/user ' + response);
                    return reply(response);
                }

                const response = apiResponse.getUnexpectedApiError();
                server.log('error', '/auth/user ' + response);
                return reply(response);
            } else if (Lodash.isEmpty(result)) {
                server.log('error', '/auth/user ' + errLogin);
                return reply(errLogin);
            }
            else {
                const sessionObj = {
                    session: result.toString()
                };
                return reply(sessionObj);
            }
        }

        server.methods.validationHeader.validateHeaders(request.headers, (err) => {

            if (!Lodash.isEmpty(err)) {
                evaluateResult(err, null);
            }
            else if (Lodash.isEmpty(credentials)) {
                evaluateResult(errLogin, null);
            }
            else {
                const device = request.headers.device;
                const version = request.headers.version;

                const passwordChecked = function () {
                    server.methods.dbQuery.getUserSession(null, credentials.email, (err, obj) => {

                        if (err) {
                            evaluateResult(err, null);
                        }
                        else if (!Lodash.isEmpty(obj)) {
                            const session = obj.toString();
                            // Refresh session expiry if existing
                            server.methods.dbQuery.refreshSessionExpiry(session, (err, obj) => {

                                evaluateResult(err, session);
                            });
                        }
                        else {
                            // Create session if no existing
                            server.methods.dbQuery.createUserSession(device, version, credentials.email, (err, obj) => {

                                evaluateResult(err, obj);
                            });
                        }
                    });
                };

                server.methods.dbQuery.getUserDetails(credentials.email, (err, obj) => {

                    if (!Lodash.isEmpty(err)) {
                        evaluateResult(err, null);
                    }
                    else if (Lodash.isEmpty(obj)) {
                        // no existing 
                        evaluateResult(errLogin, null);
                    }
                    else {
                        const hashPwd = obj.password;
                        Bcryptjs.compare(credentials.password, hashPwd, (err, res) => {

                            if (res === false) {
                                // Password did not matched, throw err
                                evaluateResult(errLogin, null);
                            }
                            else {
                                // Password matched
                                passwordChecked();
                            }
                        });
                    }
                });
            }
        });
    };
};
