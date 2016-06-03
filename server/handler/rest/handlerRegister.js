'use strict';

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const headerValidator = server.methods.validationHeader;
        const userValidator = server.methods.validationUser;
        const apiResponse = server.methods.apiResponse;

        headerValidator.validateHeaders(request.headers, (err) => {

            if (err) {

                const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                server.log('error', '/user/register ' + response);
                reply(response);

            }
            else {
                const user = request.payload;

                // Validate user details password for registration
                const checkPassword = () => {

                    userValidator.validatePassword(user.password, (err) => {

                        if (err) {
                            const responseError = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                            server.log('error', '/user/register ' + responseError);
                            reply(responseError);
                        }
                        else {
                            server.methods.dbQuery.writeUserDetails(user, (err, obj) => {
                                if (err) {
                                    const response = apiResponse.getUnexpectedApiError();
                                    server.log('error', '/user/register ' + response);
                                    reply(response);
                                }
                                else {
                                    reply(apiResponse.constructApiResponse(201, 201, user.name + ' registered'));
                                }
                            });
                        }
                    });
                };

                // Check if email is already registered
                const checkIfEmailExists = (email) => {
                    server.methods.dbQuery.getUserDetails(email, (err, obj) => {
                        if (err) {
                            const response = apiResponse.getUnexpectedApiError();
                            server.log('error', '/user/register ' + response);
                            reply(response);
                        }
                        else if (obj) {
                            const response = apiResponse.getEmailAlreadyExistError();
                            server.log('error', '/user/register ' + response);
                            reply(response);
                        }
                        else {
                            checkPassword();
                        }
                    });
                };

                // Validate user details for registration
                userValidator.validateUserDetails(user, (err) => {
                    if (err) {
                        const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                        server.log('error', '/user/register ' + response);
                        reply(response);
                    }
                    else {
                        checkIfEmailExists(user.email);
                    }
                });
            }
        });
    };
};
