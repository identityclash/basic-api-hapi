'use strict';

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const authValidator = server.methods.validationAuth;
        const apiResponse = server.methods.apiResponse;

        authValidator.validateAuth(server, request.headers, request.payload, (err, result) => {
            if (err) {
                const response = apiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                server.log('error', '/auth/user ' + response);
                reply(response);
            }
            else {
                const sessionObj = {
                    session: result.toString()
                };
                reply(sessionObj);
            }
        });
    };

};
