'use strict';

const authValidation = require('../validation/auth_validation');
const apiResponse = require('./api_response');
const utils = require('../../utility/util');

const scheme = function (server, options) {

    return {
        authenticate: function (request, reply) {

            const req = request.raw.req;
            const sessionToken = req.headers.goclasstoken;
            const device = req.headers.goclassdevice;
            const version = req.headers.goclassversion;
            
            if (!sessionToken) {
                return reply(apiResponse.constructApiErrorResponse(401, 401, 'Unauthorized'));
                
            } else {
                authValidation.validateSession(server, req.headers, function(err) {
                    if (err) {
                        return reply(apiResponse.constructApiErrorResponse(401, 401, 'Unauthorized'));
                        
                    } else {
                        server.methods.db.refreshSessionExpiry(sessionToken);
                        // required to return object 'result' with 'credentials' property
                        let result = {
                            credentials: sessionToken
                        };
                        return reply.continue(result);
                    }
                });
            }
        }
    };
};

exports.register = function (server, options, next) {

    server.auth.scheme('goclassauthscheme', scheme);
    server.auth.strategy('goclassauth', 'goclassauthscheme');

    const apiAuth = require('./api_auth');
    const apiUser = require('./api_user');

    // User login
	server.route({
	    method: 'POST',
	    path: '/auth/user',
	    handler: apiAuth.auth
	});

    // User register
    server.route({
        method: 'POST',
        path: '/user/register',
        handler: apiUser.userRegister
    });

    // User get details
    server.route({
        method: 'GET',
        path: '/user/{email}',
        config: {
            auth: 'goclassauth',
            handler: apiUser.userGetDetails
        }
    });

    // User update details
    server.route({
        method: 'POST',
        path: '/user/{email}',
        config: {
            auth: 'goclassauth',
            handler: apiUser.userUpdateDetails
        }
    });

    // User update password
    server.route({
        method: 'POST',
        path: '/user/{email}/password',
        config: {
            auth: 'goclassauth',
            handler: apiUser.userChangePassword
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};