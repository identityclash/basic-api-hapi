'use strict';

// check if user registration details is valid
const validateUserRegistration = function (payload, cb) {
    let err = {
        error_code: 422,
        error_message: 'User details is empty'
    };
    let userRegDetails = JSON.parse(payload); 
    if (!payload) {
        cb(err, payload, 0);
    } else if (!userRegDetails.name) {
        err.error_code = 423;
        err.error_message = 'Invalid name';
        cb(err, payload, 0);
    } else {
        cb(null, userRegDetails, 0);
    }
};

module.exports = {
    validateRegistration: validateUserRegistration
};