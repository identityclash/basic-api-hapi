'use strict';

const Validator = require('validator');

/**
 * Check if user registration details is valid.
 * @param payload The JSON String of User object containing the details.
 * @param cb The callback function when User object details has been checked.
 */
const validateUserRegistration = function (payload, cb) {
    let err = {
        error_code: 422,
        error_message: 'User details invalid. Must not be empty.'
    };

    let userRegDetails = JSON.parse(payload);

    if (!payload) {
        // user details empty
        cb(err, payload, 0);

    } else if (!isNameValid(userRegDetails.name)) {
        // user name not specified or invalid
        err.error_code = 423;
        err.error_message = 'Invalid name';
        cb(err, payload, 0);

    } else if (!isEmailvalid(userRegDetails.email)) {
        // user email not specified or invalid
        err.error_code = 424;
        err.error_message = 'Invalid email';
        cb(err, payload, 0);

    } else if (!isBirthdateValid(userRegDetails.birthday)) {
        // user birthday invalid, must be at least 18yrs old and max 50 yrs old
        err.error_code = 425;
        err.error_message = 'Invalid birthday, must be at least 18yrs old and not older than 50yrs old.';
        cb(err, payload, 0);

    } else if (!isGenderValid(userRegDetails.gender)) {
        // user birthday invalid, must be at least 18yrs old and max 50 yrs old
        err.error_code = 426;
        err.error_message = 'Invalid gender. Must be \'M\' or \'F\' values only';
        cb(err, payload, 0);

    } else if (!isPasswordValid(userRegDetails.password)) {
        // user password invalid, must be alphanumeric characters only
        err.error_code = 427;
        err.error_message = 'Invalid password. Must be a letter or a number characters.';
        cb(err, payload, 0);

    } else {
        // success, return user details that was saved
        cb(null, userRegDetails, 0);
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
    if (Validator.isAlphanumeric(password, 'en-US')) {
        isPwdValid = true;
    }
    return isPwdValid;
}

module.exports = {
    validateRegistration: validateUserRegistration
};