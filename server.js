'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();

const authValidation = require('./auth_validation');
const userValidation = require('./user_validation');
const apiResponse = require('./api_response');
const dbRedis = require('./db_redis');

server.connection({ port: 3000 });
server.app.alias = 'GoClass';

server.method('user.details.validate', userValidation.validateUserDetails);
server.method('user.details.password.validate', userValidation.validateUserDetailsPassword);
server.method('auth.validate', authValidation.validateAuth);

// User login
server.route({
    method: 'POST',
    path: '/auth/user',
    handler: function (request, reply) {
        let credentials = request.payload;

        // validate user registration details
        server.methods.auth.validate(credentials, function (err, result) {
            if (err) {
                let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                server.log('error', '/auth/user ' + response);
                reply(response);
            } else {
                let session = {
                    'session': result
                }
                reply(session);
            }
        });
    }
});

// User register
server.route({
    method: 'POST',
    path: '/user/register',
    handler: function (request, reply) {
        let user = request.payload;

        // validate user details password for registration
        let checkPassword = function () {
            server.methods.user.details.password.validate(user, function (err, result) {
                if (err) {
                    let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                    server.log('error', '/user/register ' + response);
                    reply(response);
                } else {
                    let userDetails = JSON.parse(result);
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

// User get details
server.route({
    method: 'GET',
    path: '/user/{email}',
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
});

// User update details
server.route({
    method: 'POST',
    path: '/user/{email}',
    handler: function (request, reply) {
        var userMod =  JSON.parse(request.payload);
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