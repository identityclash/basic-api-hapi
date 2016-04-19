'use strict';

/**
 * Check if user registration details is valid.
 * @param payload The JSON String of User object containing the details.
 * @param cb The callback function when User object details has been checked.
 */ 
const validateUserRegistration = function (payload, cb) {
    let err = {
        error_code: 422,
        error_message: 'User details is empty'
    };
    
    let userRegDetails = JSON.parse(payload); 
    
    if (!payload) {
        // user details empty
        cb(err, payload, 0);
    } else if (!userRegDetails.name) {
        // user name not specified or invalid
        err.error_code = 423;
        err.error_message = 'Invalid name';
        cb(err, payload, 0);
    } else {
        // success, user details valid
        cb(null, userRegDetails, 0);
    }
};

module.exports = {
    validateRegistration: validateUserRegistration
};