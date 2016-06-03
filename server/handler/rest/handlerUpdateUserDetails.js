'use strict';

const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;
        const userValidator = server.methods.validationUser;

        const userMod = request.payload;
        const email = request.params.email;

        // Validate and update user details if exists

        const updateUserDetails = (user) => {
            userValidator.validateUserDetails(user, (err) => {

                if (err) {
                    const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                    server.log('error', '/user/' + request.params.email + ' ' + response);
                    reply(response);
                }
                else {
                    server.methods.dbQuery.updateUserDetails(user, (err, obj) => {
                        if (err) {
                            const response = apiResponse.getUnexpectedApiError();
                            server.log('error', '/user/' + request.params.email + ' ' + response);
                            reply(response);
                        }
                        else {
                            const response = apiResponse.constructApiResponse(200, 200, 'User updated.');
                            reply(response);
                        }
                    });
                }
            });
        };

        // Check first if User exists

        server.methods.dbQuery.getUserDetails(email, (err, obj) => {
            if (err) {
                server.log('error', '/user/' + email + ' ' + err);
                reply(apiResponse.getUnexpectedApiError());
            }
            else if (Lodash.isEmpty(obj)) {
                reply(apiResponse.getUserNonExistentError());
            }
            else {
                // Set fields that should NOT be updated
                userMod.email = obj.email;
                userMod.gender = obj.gender;
                updateUserDetails(userMod);
            }
        });
    };

};
