'use strict';

const Bcryptjs = require('bcryptjs');// pasword encyption

const authValidation = require('../validation/auth_validation');
const apiResponse = require('./api_response');

const auth = function (request, reply) {
    const server = request.server;
    authValidation.validateAuth(request.server, request.headers, request.payload, function (err, result) {
        if (err) {
            let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
            server.log('error', '/auth/user ' + response);
            reply(response).type('application/json');
        } else {            
            let sessionObj = {
                'session': result.toString()
            };
            reply(sessionObj);
        }
    });
};
    
module.exports = {
    auth: auth
};