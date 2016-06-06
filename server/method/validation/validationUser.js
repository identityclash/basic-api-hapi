'use strict';

const Validator = require('validator');
const Lodash = require('lodash');

function isNameValid(name) {

    if (Lodash.isEmpty(name)) {
        return false;
    }

    const trimmedName = Validator.trim(name);
    const tokenizeName = trimmedName.split(' ');
    for (let i = 0; i < tokenizeName.length; i++) {
        if (!Validator.isAlpha(tokenizeName[i])) {
            return false;
        }
    }

    return true;
}

function isEmailvalid(email) {
    if (Lodash.isEmpty(email) || !Validator.isEmail(email)) {
        return false;
    }
    return true;
}

function isBirthdateValid(birthday) {
    if (Lodash.isNumber(birthday)) {
        const minBday = new Date();
        const maxBday = new Date(minBday);

        // 50 yrs old max allowed age, 18 yrs old minimum allowed age
        minBday.setYear(minBday.getYear() - 50);
        maxBday.setYear(minBday.getYear() - 18);

        const bdayStr = String(birthday);

        let isValid = false;
        if (!Validator.isBefore(bdayStr, minBday.toString())
            && !Validator.isAfter(bdayStr, maxBday.toString())) {
            isValid = true;
        }
        return isValid;
    }
    return false;
}

function isGenderValid(gender) {
    if (!Lodash.isEmpty(gender) && (Validator.equals(gender, 'M') || Validator.equals(gender, 'F'))) {
        return true;
    }
    return false;
}

function isPasswordValid(password) {
    if (!Lodash.isEmpty(password) && Validator.isAlphanumeric(password, 'en-US') && password.length >= 8) {
        return true;
    }
    return false;
}

/**
 * Check if user details is valid.
 * @param payload The User object containing the details.
 * @param cb The callback function when User object details has been checked.
 */
const validateUserDetails = function (userDetails, cb) {
    const error = {
        errorCode: 422,
        errorMessage: 'User details invalid. Must not be empty.'
    };
    if (!userDetails) {
        // User details empty
        return cb(error, userDetails, 0);
    }
    else if (!isNameValid(userDetails.name)) {
        // User name not specified or invalid
        error.errorCode = 423;
        error.errorMessage = 'Invalid name';
        return cb(error, userDetails, 0);
    }
    else if (!isEmailvalid(userDetails.email)) {
        // User email not specified or invalid
        error.errorCode = 424;
        error.errorMessage = 'Invalid email';
        return cb(error, userDetails, 0);
    }
    else if (!isBirthdateValid(userDetails.birthday)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 425;
        error.errorMessage = 'Invalid birthday, must be at least 18yrs old and not older than 50yrs old.';
        return cb(error, userDetails, 0);
    }
    else if (!isGenderValid(userDetails.gender)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 426;
        error.errorMessage = 'Invalid gender. Must be \'M\' or \'F\' values only';
        return cb(error, userDetails, 0);
    }
    // Success, return user details that was saved
    return cb(null, userDetails, 0);
};

/**
 * Check if user password is valid.
 * @param payload The password string.
 * @param cb The callback function when User object password has been checked.
 */
const validatePassword = function (payload, cb) {
    const error = {
        errorCode: 428,
        errorMessage: 'User password invalid. Must be letters or numbers. Minimum of 8 characters.'
    };

    if (!payload || !isPasswordValid(payload)) {
        // User password invalid, must be alphanumeric characters only
        return cb(error, payload, 0);
    }

    // Success, return user details that was saved
    return cb(null, payload, 0);
};

module.exports = {
    validateUserDetails: validateUserDetails,
    validatePassword: validatePassword
};
