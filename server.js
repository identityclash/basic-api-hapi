'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Bcryptjs = require('bcryptjs');

const server = new Hapi.Server();

const authValidation = require('./validation/auth_validation');
const userValidation = require('./validation/user_validation');
const headerValidation = require('./validation/header_validation');
const apiResponse = require('./api_response');
const dbRedis = require('./db_redis');

server.connection({ port: 3000 });
server.app.alias = 'GoClass';

server.method('header.validate', headerValidation.validateHeaders);
server.method('user.details.validate', userValidation.validateUserDetails);
server.method('user.details.password.validate', userValidation.validatePassword);
server.method('auth.validate', authValidation.validateAuth);


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
                authValidation.validateSession(req.headers, function(err) {
                    if (err) {
                        return reply(apiResponse.constructApiErrorResponse(401, 401, 'Unauthorized'));
                        
                    } else {
                        dbRedis.refreshSessionExpiry(sessionToken);
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

server.auth.scheme('goclassauthscheme', scheme);
server.auth.strategy('goclassauth', 'goclassauthscheme');


// User login
server.route({
    method: 'POST',
    path: '/auth/user',
    handler: function (request, reply) {

        // validate user registration details
        server.methods.auth.validate(request.headers, request.payload, function (err, result) {
            if (err) {
                let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                server.log('error', '/auth/user ' + response);
                reply(response);
            } else {            
                let sessionObj = {
                    'session': result.toString()
                };
                reply(sessionObj);
            }
        });
    }
});


// User register
server.route({
    method: 'POST',
    path: '/user/register',
    handler: function (request, reply) {
        
        server.methods.header.validate(request.headers, function(err) {
            if (err) {
                // no headers of 'GoClassDevice' && 'GoClassVersion'
                let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                server.log('error', '/user/register ' + response);
                reply(response);
                        
            } else {
                let user = request.payload;

                // validate user details password for registration
                let checkPassword = function () {
                    let userDetails = JSON.parse(user);
                    server.methods.user.details.password.validate(userDetails.password, function (err, result) {
                        if (err) {
                            let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                            server.log('error', '/user/register ' + response);
                            reply(response);
                            
                        } else {
                            dbRedis.writeUserDetails(userDetails);
                            let response = apiResponse.constructApiResponse(201, 201, userDetails.name + ' registered');
                            reply(response);
                            
                        }
                    });
                };

                // validate user details for registration
                server.methods.user.details.validate(user, function (err, result) {
                    if (err) {
                        let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                        server.log('error', '/user/register ' + response);
                        reply(response);
                        
                    } else {
                        checkPassword();
                        
                    }
                });   
                 
            }
        });
    }
});


// User get details
server.route({
    method: 'GET',
    path: '/user/{email}',
    config: {
        auth: 'goclassauth',
        handler: function (request, reply) {
            let userEmail = encodeURIComponent(request.params.email);
            dbRedis.getUserDetails(decodeURIComponent(userEmail), function (err, obj) {
                if (err) {
                    server.log('error', '/user/' + request.params.email + " " + err);
                    reply(apiResponse.getUnexpectedApiError());
                } else if (obj == null) {
                    reply(apiResponse.getUserNonExistentError());
                } else {
                    delete obj.password;// remove 'password' property in response
                    reply(JSON.stringify(obj));
                }
            });
        }
    }
});


// User update details
server.route({
    method: 'POST',
    path: '/user/{email}',
    config: {
        auth: 'goclassauth',
        handler: function (request, reply) {
            let userMod = JSON.parse(request.payload);
            let email = request.params.email;

            // validate and update user details if exists
            let updateUserDetails = function (user) {
                server.methods.user.details.validate(JSON.stringify(user), function (err, result) {
                    if (err) {
                        let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                        server.log('error', '/user/' + request.params.email + " " + response);
                        reply(response);
                    } else {
                        dbRedis.updateUserDetails(user);
                        let response = apiResponse.constructApiResponse(200, 200, 'User updated.');
                        reply(response);
                    }
                });
            };

            // check first if User exists
            dbRedis.getUserDetails(email, function (err, obj) {
                if (err) {
                    server.log('error', '/user/' + email + " " + err);
                    reply(apiResponse.getUnexpectedApiError());
                } else if (obj == null) {
                    reply(apiResponse.getUserNonExistentError());
                } else {
                    // set fields that should NOT be updated
                    userMod.email = obj.email;
                    userMod.gender = obj.gender;
                    updateUserDetails(userMod);
                }
            });
        }
    }
});


// User update password
server.route({
    method: 'POST',
    path: '/user/{email}/password',
    config: {
        auth: 'goclassauth',
        handler: function (request, reply) {
            let passwordDetails = JSON.parse(request.payload);// contains 'old_password' and 'new_password'
            let email = request.params.email;

            // Check if new_password is valid
            let checkNewPassword = function () {
                server.methods.user.details.password.validate(passwordDetails.new_password, function (err, result) {
                    if (err) {
                        let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                        server.log('error', '/user/' + email + '/password ' + response);
                        reply(response);

                    } else {
                        dbRedis.updateUserPassword(email, passwordDetails.new_password);
                        let response = apiResponse.constructApiResponse(200, 200, 'Password updated.');
                        reply(response);
                    }
                });
            };

            // check first if User exists
            dbRedis.getUserDetails(email, function (err, obj) {
                if (err) {
                    server.log('error', '/user/' + email + '/password ' + err);
                    reply(apiResponse.getUnexpectedApiError());

                } else if (obj == null) {
                    reply(apiResponse.getUserNonExistentError());

                } else {
                    // Check if old_password matches the stored current user password in database
                    Bcryptjs.compare(passwordDetails.old_password, obj.password, function (err, res) {
                        if (err || res == false) {
                            let response = apiResponse.constructApiErrorResponse(400, 400, 'Password invalid.');
                            server.log('error', '/user/' + email + '/password ' + response);
                            reply(response);
                        } else {
                            checkNewPassword(); // password matched
                        }
                    });

                }
            });
        }
    }
});


server.register({
    register: Good,
    options: {
            reporters: [{
                reporter: require('good-console'),
                events: {
                    response: '*',
                    log: '*'
                }
            }]
        }
    }, (err) => {

        if (err) {
            throw err; // something bad happened loading the plugin
        }

        server.start((err) => {

            if (err) {
                throw err;
            }
            server.log('info', 'server running at: ' + server.info.uri);
        });
});