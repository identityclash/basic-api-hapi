'use strict';

module.exports = () => {
        
    return (request, reply) => {
        
        const server = request.server;
        const headerValidator = server.methods.validationHeader;
        const userValidator = server.methods.validationUser;
        const apiResponse = server.methods.apiResponse;

        headerValidator.validateHeaders(request.headers, (err) => {

            if (err) {

                let response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                server.log('error', '/user/register ' + response);
                reply(response).type('application/json');

            } else {
                let user = request.payload;

                // Validate user details password for registration
                let checkPassword = () => {

                    let userDetails = JSON.parse(user);
                    userValidator.validatePassword(userDetails.password, (err) => {

                        if (err) {
                            let responseError = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                            server.log('error', '/user/register ' + responseError);
                            reply(responseError);
                        } else {
                            server.methods.dbQuery.writeUserDetails(userDetails, (err, obj) => {
                                if (err) {
                                    server.log('error', '/user/register ' + response);
                                    reply(response);
                                } else {
                                    reply(apiResponse.constructApiResponse(201, 201, userDetails.name + ' registered'));
                                }
                            });
                        }
                    });
                };

                // Check if email is already registered
                let checkIfEmailExists = (email) => {
                    
                    server.methods.dbQuery.getUserDetails(email, (err, obj) => {
                        if (err) {
                            const response = apiResponse.getUnexpectedApiError();
                            server.log('error', '/user/register ' + response);
                            reply(response);
                        } else if (obj) {
                            const response = apiResponse.getEmailAlreadyExistError();
                            server.log('error', '/user/register ' + response);
                            reply(response);
                        } else {
                            checkPassword();
                        }
                    });
                };

                // Validate user details for registration
                userValidator.validateUserDetails(user, (err) => {
                    if (err) {
                        let response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                        server.log('error', '/user/register ' + response);
                        reply(response).type('application/json');
                    } else {
                        let userDetails = JSON.parse(user);
                        checkIfEmailExists(userDetails.email);
                    }
                });
            }
        });  
    };
};
