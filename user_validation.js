'use strict';

const Validator = require('validator');

/**
 * Check if user details is valid.
 * @param payload The JSON String of User object containing the details.
 * @param cb The callback function when User object details has been checked.
 */
const validateUserDetails = function (payload, cb) {
    let err = {
        error_code: 422,
        error_message: 'User details invalid. Must not be empty.'
    };

    let userDetails = JSON.parse(payload);

    if (!payload) {
        // user details empty
        cb(err, payload, 0);

    } else if (!isNameValid(userDetails.name)) {
        // user name not specified or invalid
        err.error_code = 423;
        err.error_message = 'Invalid name';
        cb(err, payload, 0);

    } else if (!isEmailvalid(userDetails.email)) {
        // user email not specified or invalid
        err.error_code = 424;
        err.error_message = 'Invalid email';
        cb(err, payload, 0);

    } else if (!isBirthdateValid(userDetails.birthday)) {
        // user birthday invalid, must be at least 18yrs old and max 50 yrs old
        err.error_code = 425;
        err.error_message = 'Invalid birthday, must be at least 18yrs old and not older than 50yrs old.';
        cb(err, payload, 0);

    } else if (!isGenderValid(userDetails.gender)) {
        // user birthday invalid, must be at least 18yrs old and max 50 yrs old
        err.error_code = 426;
        err.error_message = 'Invalid gender. Must be \'M\' or \'F\' values only';
        cb(err, payload, 0);

    } else {
        // success, return user details that was saved
        cb(null, payload, 0);
    }
};

/**
 * Check if user password is valid.
 * @param payload The password string.
 * @param cb The callback function when User object password has been checked.
 */
const validatePassword = function (payload, cb) {
    let err = {
        error_code: 428,
        error_message: 'User password invalid. Must be letters or numbers. Minimum of 8 characters.'
    };

    if (!payload || !isPasswordValid(payload)) {
        // user password invalid, must be alphanumeric characters only
        cb(err, payload, 0);

    } else {
        // success, return user details that was saved
        cb(null, payload, 0);
    }
};

function isNameValid(name) {
    let isNameValid = true;
    if (!name || name == null || name == undefined) {
        isNameValid = false;
    } else {
        let trimmedName = Validator.trim(name);
        var tokenizeName = trimmedName.split(" ");
        for (var i = 0; i < tokenizeName.length; i++) {
            if (!Validator.isAlpha(tokenizeName[i])) {
                isNameValid = false;
                break;
            }
        }
    }
    return isNameValid;
}

function isEmailvalid(email) {
    let isEmailValid = true;
    if (!Validator.isEmail(email)) {
        isEmailvalid = false;
    }
    return isEmailvalid;
}

function isBirthdateValid(birthday) {
    let isBdayValid = false;
    var minBday = new Date();
    var maxBday = new Date(minBday);

    minBday.setYear(minBday.getYear() - 50);// 50 yrs old, max allowed age
    maxBday.setYear(minBday.getYear() - 18);// 18 yrs old, minimum allowed age

    var bdayStr = birthday + '';

    if (!Validator.isBefore(bdayStr, minBday.toString()) 
        && !Validator.isAfter(bdayStr, maxBday.toString())) {
        isBdayValid = true;
    }
    return isBdayValid;
}

function isGenderValid(gender) {
    let isGenderValid = false;
    if (Validator.equals(gender, 'M') || Validator.equals(gender, 'F')) {
        isGenderValid = true;
    }
    return isGenderValid;
}

function isPasswordValid(password) {
    let isPwdValid = false;
    if (Validator.isAlphanumeric(password, 'en-US') && password.length >= 8) {
        isPwdValid = true;
    }
    return isPwdValid;
}

module.exports = {
    validateUserDetails: validateUserDetails,
    validatePassword: validatePassword
};