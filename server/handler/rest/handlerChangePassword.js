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

        // Check if newPassword is valid

        const checkNewPassword = () => {

            userValidator.validatePassword(passwordDetails.newPassword, (err) => {

                if (err) {
                    const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                    server.log('error', '/user/' + email + '/password ' + response);
                    reply(response);

                }
                else {
                    server.methods.dbQuery.updateUserPassword(email, passwordDetails.newPassword, (err, obj) => {
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
                server.log('error', '/user/' + email + '/password');
                reply(apiResponse.getUserNonExistentError());
            }
            else {

                // Check if oldPassword matches the stored current user password in database

                Bcryptjs.compare(passwordDetails.oldPassword, obj.password, (err, res) => {

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
