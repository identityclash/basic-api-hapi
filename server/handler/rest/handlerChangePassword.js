'use strict';

const Bcryptjs = require('bcryptjs');
const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;
        const userValidator = server.methods.validationUser;

        const passwordDetails = request.payload;
        const email = request.params.email;

        // Check if new_password is valid

        const checkNewPassword = () => {
            userValidator.validatePassword(passwordDetails.new_password, (err) => {

                if (err) {
                    const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                    server.log('error', '/user/' + email + '/password ' + response);
                    reply(response).type('application/json');

                }
                else {
                    server.methods.dbQuery.updateUserPassword(email, passwordDetails.new_password, (err, obj) => {
                        if (err) {
                            const response = apiResponse.getUnexpectedApiError();
                            server.log('error', '/user/' + email + '/password ' + response);
                            reply(response);
                        }
                        else {
                            const response = apiResponse.constructApiResponse(200, 200, 'Password updated.');
                            reply(response);
                        }
                    });
                }
            });
        };

        // Check first if User exists

        server.methods.dbQuery.getUserDetails(email, (err, obj) => {
            if (err) {
                server.log('error', '/user/' + email + '/password ' + err);
                reply(apiResponse.getUnexpectedApiError());
            }
            else if (Lodash.isEmpty(obj)) {
                reply(apiResponse.getUserNonExistentError());
            }
            else {

                // Check if old_password matches the stored current user password in database

                Bcryptjs.compare(passwordDetails.old_password, obj.password, (err, res) => {

                    if (err || res === false) {
                        const response = apiResponse.constructApiErrorResponse(400, 400, 'Password invalid.');
                        server.log('error', '/user/' + email + '/password ' + response);
                        reply(response);
                    }
                    else {
                        checkNewPassword();
                    }
                });
            }
        });
    };

};
