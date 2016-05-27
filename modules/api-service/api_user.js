'use strict';

const Bcryptjs = require('bcryptjs');
const ApiResponse = require('./api_response');
const HeaderValidation = require('../validation/header_validation');
const UserValidation = require('../validation/user_validation');

const register = function (request, reply) {

    const server = request.server;
    HeaderValidation.validateHeaders(request.headers, (err) => {
        if (err) {
            let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
            server.log('error', '/user/register ' + response);
            reply(response).type('application/json');
        } else {
            let user = request.payload;

            // Validate user details password for registration

            let checkPassword = () => {

                let userDetails = JSON.parse(user);
                UserValidation.validatePassword(userDetails.password, (err) => {

                    if (err) {
                        let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                        server.log('error', '/user/register ' + response);
                        reply(response).type('application/json');
                    } else {
                        server.methods.db.writeUserDetails(userDetails);
                        let response = ApiResponse.constructApiResponse(201, 201, userDetails.name + ' registered');
                        reply(response).type('application/json');
                    }
                });
            };

            // Check if email is already registered
            let checkIfEmailExists = (email) => {

                server.methods.db.getUserDetails(email, (err, obj) => {
                    if (err) {
                        const response = ApiResponse.getUnexpectedApiError();
                        server.log('error', '/user/register ' + response);
                        reply(response);
                    } else if (obj) {
                        const response = ApiResponse.getEmailAlreadyExistError();
                        server.log('error', '/user/register ' + response);
                        reply(response);
                    } else {
                        checkPassword();
                    }
                });
            };

            // Validate user details for registration

            UserValidation.validateUserDetails(user, (err) => {

                if (err) {
                    let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
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

const getDetails = function (request, reply) {
    const server = request.server;
    let userEmail = encodeURIComponent(request.params.email);
    server.methods.db.getUserDetails(decodeURIComponent(userEmail), (err, obj) => {

        if (err) {
            server.log('error', '/user/' + request.params.email + ' ' + err);
            reply(ApiResponse.getUnexpectedApiError()).type('application/json');
        } else if (obj == null) {
            reply(ApiResponse.getUserNonExistentError());
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

    // Validate and update user details if exists

    let updateUserDetails = (user) => {
        UserValidation.validateUserDetails(JSON.stringify(user), (err) => {

            if (err) {
                let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                server.log('error', '/user/' + request.params.email + ' ' + response);
                reply(response).type('application/json');
            } else {
                server.methods.db.updateUserDetails(user);
                let response = ApiResponse.constructApiResponse(200, 200, 'User updated.');
                reply(response).type('application/json');
            }
        });
    };

    // Check first if User exists

    server.methods.db.getUserDetails(email, (err, obj) => {
        if (err) {
            server.log('error', '/user/' + email + ' ' + err);
            reply(ApiResponse.getUnexpectedApiError()).type('application/json');
        } else if (obj == null) {
            reply(ApiResponse.getUserNonExistentError()).type('application/json');
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
    let passwordDetails = JSON.parse(request.payload);
    let email = request.params.email;

    // Check if new_password is valid

    let checkNewPassword = () => {
        UserValidation.validatePassword(passwordDetails.new_password, (err) => {

            if (err) {
                let response = ApiResponse.constructApiErrorResponse(400, err.errorCode, err.errorMessage);
                server.log('error', '/user/' + email + '/password ' + response);
                reply(response).type('application/json');

            } else {
                server.methods.db.updateUserPassword(email, passwordDetails.new_password);
                let response = ApiResponse.constructApiResponse(200, 200, 'Password updated.');
                reply(response).type('application/json');
            }
        });
    };

    // Check first if User exists

    server.methods.db.getUserDetails(email, (err, obj) => {
        if (err) {
            server.log('error', '/user/' + email + '/password ' + err);
            reply(ApiResponse.getUnexpectedApiError()).type('application/json');
        } else if (obj == null) {
            reply(ApiResponse.getUserNonExistentError()).type('application/json');
        } else {

            // Check if old_password matches the stored current user password in database

            Bcryptjs.compare(passwordDetails.old_password, obj.password, (err, res) => {

                if (err || res == false) {
                    let response = ApiResponse.constructApiErrorResponse(400, 400, 'Password invalid.');
                    server.log('error', '/user/' + email + '/password ' + response);
                    reply(response).type('application/json');
                } else {
                    checkNewPassword();
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
