'use strict';

const AuthValidation = require('../validation/auth_validation');
const ApiResponse = require('./api_response');

const auth = function (request, reply) {
    const server = request.server;
    AuthValidation.validateAuth(request.server, request.headers, request.payload, (err, result) => {
        if (err) {
            let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
            server.log('error', '/auth/user ' + response);
            reply(response).type('application/json');
        } else {
            let sessionObj = {
                session: result.toString()
            };
            reply(sessionObj);
        }
    });
};

module.exports = {
    auth: auth
};
