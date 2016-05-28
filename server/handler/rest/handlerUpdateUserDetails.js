'use strict';

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;
        const userValidator = server.methods.validationUser;

        let userMod = JSON.parse(request.payload);
        let email = request.params.email;

        // Validate and update user details if exists

        let updateUserDetails = (user) => {
            userValidator.validateUserDetails(JSON.stringify(user), (err) => {

                if (err) {
                    let response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                    server.log('error', '/user/' + request.params.email + ' ' + response);
                    reply(response);
                } else {
                    server.methods.dbQuery.updateUserDetails(user, (err, obj) => {
                        if (err) {
                            let response = apiResponse.getUnexpectedApiError();
                            server.log('error', '/user/' + request.params.email + ' ' + response);
                            reply(response);
                        } else {
                            let response = apiResponse.constructApiResponse(200, 200, 'User updated.');
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
            } else if (obj === null) {
                reply(apiResponse.getUserNonExistentError());
            } else {
                // set fields that should NOT be updated
                userMod.email = obj.email;
                userMod.gender = obj.gender;
                updateUserDetails(userMod);
            }
        });
    };

};
