'use strict';

const Bcryptjs = require('bcryptjs');

const apiResponse = require('./api_response');
const headerValidation = require('../validation/header_validation');
const userValidation = require('../validation/user_validation');

const register = function (request, reply) {

    const server = request.server;
	        
    headerValidation.validateHeaders(request.headers, function(err) {
        if (err) {
            // no headers of 'Device' && 'Version'
            let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
            server.log('error', '/user/register ' + response);
            reply(response).type('application/json');
                    
        } else {
            let user = request.payload;

            // validate user details password for registration
            let checkPassword = function () {
                let userDetails = JSON.parse(user);
                userValidation.validatePassword(userDetails.password, function (err, result) {
                    if (err) {
                        let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                        server.log('error', '/user/register ' + response);
                        reply(response).type('application/json');
                        
                    } else {
                        server.methods.db.writeUserDetails(userDetails);
                        let response = apiResponse.constructApiResponse(201, 201, userDetails.name + ' registered');
                        reply(response).type('application/json');
                        
                    }
                });
            };

            // validate user details for registration
            userValidation.validateUserDetails(user, function (err, result) {
                if (err) {
                    let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                    server.log('error', '/user/register ' + response);
                    reply(response).type('application/json');
                    
                } else {
                    checkPassword();
                    
                }
            });   
             
        }
    });
};


const getDetails = function (request, reply) {

    const server = request.server;

    let userEmail = encodeURIComponent(request.params.email);
    server.methods.db.getUserDetails(decodeURIComponent(userEmail), function (err, obj) {
        if (err) {
            server.log('error', '/user/' + request.params.email + " " + err);
            reply(apiResponse.getUnexpectedApiError()).type('application/json');
        } else if (obj == null) {
            reply(apiResponse.getUserNonExistentError());
        } else {
            delete obj.password;// remove 'password' property in response
            reply(JSON.stringify(obj)).type('application/json');
        }
    });
};


const updateDetails = function (request, reply) {

    const server = request.server;

    let userMod = JSON.parse(request.payload);
    let email = request.params.email;

    // validate and update user details if exists
    let updateUserDetails = function (user) {
        userValidation.validateUserDetails(JSON.stringify(user), function (err, result) {
            if (err) {
                let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                server.log('error', '/user/' + request.params.email + " " + response);
                reply(response).type('application/json');
            } else {
                server.methods.db.updateUserDetails(user);
                let response = apiResponse.constructApiResponse(200, 200, 'User updated.');
                reply(response).type('application/json');
            }
        });
    };

    // check first if User exists
    server.methods.db.getUserDetails(email, function (err, obj) {
        if (err) {
            server.log('error', '/user/' + email + " " + err);
            reply(apiResponse.getUnexpectedApiError()).type('application/json');
        } else if (obj == null) {
            reply(apiResponse.getUserNonExistentError()).type('application/json');
        } else {
            // set fields that should NOT be updated
            userMod.email = obj.email;
            userMod.gender = obj.gender;
            updateUserDetails(userMod);
        }
    });
};


const changePassword = function (request, reply) {

    const server = request.server;

    let passwordDetails = JSON.parse(request.payload);// contains 'old_password' and 'new_password'
    let email = request.params.email;

    // Check if new_password is valid
    let checkNewPassword = function () {
        userValidation.validatePassword(passwordDetails.new_password, function (err, result) {
            if (err) {
                let response = apiResponse.constructApiErrorResponse(400, err.error_code, err.error_message);
                server.log('error', '/user/' + email + '/password ' + response);
                reply(response).type('application/json');

            } else {
                server.methods.db.updateUserPassword(email, passwordDetails.new_password);
                let response = apiResponse.constructApiResponse(200, 200, 'Password updated.');
                reply(response).type('application/json');
            }
        });
    };

    // check first if User exists
    server.methods.db.getUserDetails(email, function (err, obj) {
        if (err) {
            server.log('error', '/user/' + email + '/password ' + err);
            reply(apiResponse.getUnexpectedApiError()).type('application/json');

        } else if (obj == null) {
            reply(apiResponse.getUserNonExistentError()).type('application/json');

        } else {
            // Check if old_password matches the stored current user password in database
            Bcryptjs.compare(passwordDetails.old_password, obj.password, function (err, res) {
                if (err || res == false) {
                    let response = apiResponse.constructApiErrorResponse(400, 400, 'Password invalid.');
                    server.log('error', '/user/' + email + '/password ' + response);
                    reply(response).type('application/json');
                } else {
                    checkNewPassword(); // password matched
                }
            });

        }
    });
};


module.exports = {
    userRegister: register,
    userGetDetails: getDetails,
    userUpdateDetails: updateDetails,
    userChangePassword: changePassword
};