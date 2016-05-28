'use strict';

const Validator = require('validator');

function isNameValid(name) {

    if (!name || name === null || name === undefined) {
        return false;
    } else {
        let trimmedName = Validator.trim(name);
        let tokenizeName = trimmedName.split(' ');
        for (let i = 0; i < tokenizeName.length; i++) {
            if (!Validator.isAlpha(tokenizeName[i])) {
                return false;
                break;
            }
        }
    }
    return true;
}

function isEmailvalid(email) {
    let isEmailValid = true;
    if (!Validator.isEmail(email)) {
        isEmailvalid = false;
    }
    return isEmailValid;
}

function isBirthdateValid(birthday) {
    let isBdayValid = false;
    let minBday = new Date();
    let maxBday = new Date(minBday);

    minBday.setYear(minBday.getYear() - 50);// 50 yrs old, max allowed age
    maxBday.setYear(minBday.getYear() - 18);// 18 yrs old, minimum allowed age

    let bdayStr = String(birthday);

    if (!Validator.isBefore(bdayStr, minBday.toString()) &&
        !Validator.isAfter(bdayStr, maxBday.toString())) {
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

/**
 * Check if user details is valid.
 * @param payload The JSON String of User object containing the details.
 * @param cb The callback function when User object details has been checked.
 */
const validateUserDetails = function (payload, cb) {
    let error = {
        errorCode: 422,
        errorMessage: 'User details invalid. Must not be empty.'
    };
    let userDetails = JSON.parse(payload);
    if (!payload) {
        // User details empty
        cb(error, payload, 0);
    } else if (!isNameValid(userDetails.name)) {
        // User name not specified or invalid
        error.errorCode = 423;
        error.errorMessage = 'Invalid name';
        cb(error, payload, 0);
    } else if (!isEmailvalid(userDetails.email)) {
        // User email not specified or invalid
        error.errorCode = 424;
        error.errorMessage = 'Invalid email';
        cb(error, payload, 0);
    } else if (!isBirthdateValid(userDetails.birthday)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 425;
        error.errorMessage = 'Invalid birthday, must be at least 18yrs old and not older than 50yrs old.';
        cb(error, payload, 0);
    } else if (!isGenderValid(userDetails.gender)) {
        // User birthday invalid, must be at least 18yrs old and max 50 yrs old
        error.errorCode = 426;
        error.errorMessage = 'Invalid gender. Must be \'M\' or \'F\' values only';
        cb(error, payload, 0);
    } else {
        // Success, return user details that was saved
        cb(null, payload, 0);
    }
};

/**
 * Check if user password is valid.
 * @param payload The password string.
 * @param cb The callback function when User object password has been checked.
 */
const validatePassword = function (payload, cb) {
    let error = {
        errorCode: 428,
        errorMessage: 'User password invalid. Must be letters or numbers. Minimum of 8 characters.'
    };
    if (!payload || !isPasswordValid(payload)) {
        // User password invalid, must be alphanumeric characters only
        cb(error, payload, 0);
    } else {
        // Success, return user details that was saved
        cb(null, payload, 0);
    }
};

module.exports = {
    validateUserDetails: validateUserDetails,
    validatePassword: validatePassword
};
