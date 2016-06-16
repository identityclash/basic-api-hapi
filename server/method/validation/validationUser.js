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

        if (Validator.isBefore(bdayStr, minBday.toString())
            || Validator.isAfter(bdayStr, maxBday.toString())) {
            return false;
        }
        return true;
    }
    return false;
}

function isGenderValid(gender) {
    if (Lodash.isEqual(gender, 'M') || Lodash.isEqual(gender, 'F')) {
        return true;
    }
    return false;
}

function isPasswordValid(password) {
    const regEx = new RegExp('^[a-zA-Z0-9]*$');
    const regExNum = new RegExp('^[0-9]*$');
    const regExLetter = new RegExp('^[a-zA-Z]*$');
    let isValid = true;
    let hasLetter = false;
    let hasNumber = false;
    for (let i = 0; i < password.length && isValid; i++) {
        const char = password.charAt(i);
        isValid = regEx.test(char);
        if (!hasLetter) {
            hasLetter = regExLetter.test(char);
        }
        if (!hasNumber) {
            hasNumber = regExNum.test(char);
        }
        if (!isValid) {
            return false;
        }
    }
    const isPasswordValid = (hasLetter && hasNumber);
    return isPasswordValid;
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
    if (Lodash.isEmpty(userDetails)) {
        // User details empty
        return cb(error);
    }
    else if (!isNameValid(userDetails.name)) {
        // User name not specified or invalid
        error.errorCode = 423;
        error.errorMessage = 'Invalid name';
        return cb(error);
    }
    else if (!isEmailvalid(userDetails.email)) {
        // User email not specified or invalid
        error.errorCode = 424;
        error.errorMessage = 'Invalid email';
        return cb(error);
    }
    else if (!isBirthdateValid(userDetails.birthday)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 425;
        error.errorMessage = 'Invalid birthday, must be at least 18yrs old and not older than 50yrs old.';
        return cb(error);
    }
    else if (!isGenderValid(userDetails.gender)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 426;
        error.errorMessage = 'Invalid gender. Must be \'M\' or \'F\' values only';
        return cb(error);
    }
    // Success, return user details that was saved
    return cb(null);
};

/**
 * Check if user password is valid.
 * @param password The password string.
 * @param cb The callback function when User object password has been checked.
 */
const validatePassword = function (password, cb) {
    const error = {
        errorCode: 428,
        errorMessage: 'User password invalid. Must be letters or numbers. Minimum of 8 characters.'
    };

    if (Lodash.isEmpty(password) || !isPasswordValid(password) || password.length < 8) {
        // User password invalid, must be alphanumeric characters only
        return cb(error);
    }

    // Success, return user details that was saved
    return cb(null);
};

module.exports = {
    validateUserDetails: validateUserDetails,
    validatePassword: validatePassword
};
