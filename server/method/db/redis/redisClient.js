'use strict';

const Redis = require('redis');
const Bcryptjs = require('bcryptjs');
const Lodash = require('lodash');
const Utils = require('../../../utility/util');

const redisClient = Redis.createClient();

redisClient.on('error', (err) => { });

/**
 * Create user session with expiry of 30 minutes.
 * @param device The device that performed the API request.
 * @param version The app or client version that performed the API request.
 * @param userEmail The user's email.
 */
const createUserSession = function (device, version, userEmail, cb) {
    const entityId = Utils.hmacMd5Encrypt(JSON.stringify(userEmail));
    const dateNow = Date.now();
    const sessionData = {
        entityId: entityId,
        email: userEmail,
        device: device,
        version: version,
        dateCreated: dateNow
    };

    const sessionToken = Utils.hmacMd5Encrypt(JSON.stringify(sessionData));
    redisClient.HMSET('session:' + sessionToken, {
        entityId: entityId,
        email: userEmail,
        device: device,
        version: version,
        dateCreated: dateNow
    });
    redisClient.set('session:email:' + entityId, sessionToken);

    // Expiry duration is 30 minutes ahead of current time
    const expiryDuration = parseInt((Number(new Date)) / 1000) + 1800;
    redisClient.expireat('session:' + sessionToken, expiryDuration);
    redisClient.expireat('session:email:' + entityId, expiryDuration);

    cb(null, sessionToken);
};

/**
 * Get user session stored in database. Return null/empty if no session found.
 * @param token The session token value.
 * @param userEmail The User's email that will be used for searching if there's an existing session token.
 */
const getUserSession = function (token, userEmail, cb) {
    const sessionToken = token;
    if (!Lodash.isEmpty(sessionToken)) {
        redisClient.hgetall('session:' + sessionToken, (err, obj) => {
            // obj Returns the sessionData object when the sessionToken was created
            cb(err, obj);
        });
    }
    else if (!Lodash.isEmpty(userEmail)) {
        const entityId = Utils.hmacMd5Encrypt(JSON.stringify(userEmail));
        redisClient.get('session:email:' + entityId, (err, obj) => {
            // obj Returns the session token string
            cb(err, obj);
        });
    }
    else {
        const err = {
            message: 'No passed arguments token or email'
        };
        cb(err, null);
    }
};

// Reset user session expiry to 30 minutes
const refreshSessionExpiry = function (sessionToken, cb) {
    redisClient.hgetall('session:' + sessionToken, (err, obj) => {

        if (err) {
            cb(err, null);
        }
        else {
            const entityId = obj.entityId;
            const expiryDuration = parseInt((Number(new Date)) / 1000) + 1800;
            redisClient.expireat('session:' + sessionToken, expiryDuration);
            redisClient.expireat('session:email:' + entityId, expiryDuration);
            cb(null, sessionToken);
        }
    });
};

/**
 * Get the details of User with the email.
 * @param userEmail The string email of User details to get.
 * @param cb The callback function when User details has been populated.
 */
const getUserDetails = function (userEmail, cb) {
    redisClient.hgetall('user:' + userEmail, (err, obj) => {
        cb(err, obj);
    });
};

/**
 * Save User object details to Redis database.
 * @param user The User object containing the details.
 */
const writeUserDetails = function (user, cb) {
    const salt = Bcryptjs.genSaltSync(10);
    const hashPwd = Bcryptjs.hashSync(user.password, salt);
    const entityId = Utils.hmacMd5Encrypt(user.userEmail);
    redisClient.HMSET('user:' + user.email, {
        entityId: entityId,
        email: user.email,
        name: user.name,
        birthday: user.birthday,
        gender: user.gender,
        password: hashPwd
    });
    cb(null, user);
};

/**
 * Update User details to Redis database.
 * @param user The User object containing the details.
 */
const updateUserDetails = function (user, cb) {
    redisClient.HMSET('user:' + user.email, {
        name: user.name,
        birthday: user.birthday
    });
    cb(null, user);
};

/**
 * Update User password to Redis database.
 * @param userEmail The user's email.
 * @param newPassword The new password to be set.
 */
const updateUserPassword = function (userEmail, newPassword, cb) {
    const salt = Bcryptjs.genSaltSync(10);
    const hashPwd = Bcryptjs.hashSync(newPassword, salt);
    redisClient.HMSET('user:' + userEmail, {
        password: hashPwd
    });
    cb(null, userEmail);
};

module.exports = {
    createUserSession: createUserSession,
    getUserSession: getUserSession,
    refreshSessionExpiry: refreshSessionExpiry,
    getUserDetails: getUserDetails,
    writeUserDetails: writeUserDetails,
    updateUserDetails: updateUserDetails,
    updateUserPassword: updateUserPassword
};
