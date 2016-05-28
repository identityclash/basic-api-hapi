'use strict';

const Redis = require('redis');
const Bcryptjs = require('bcryptjs');
const Utils = require('../../../utility/util');

const redisClient = Redis.createClient();

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

/**
 * Create user session with expiry of 30 minutes.
 * @param device The device that performed the API request.
 * @param version The app or client version that performed the API request.
 * @param userEmail The user's email.
 */
const createUserSession = function (device, version, userEmail, cb) {
    const entityId = Utils.hmacMd5Encrypt(JSON.stringify(userEmail));
    const dateNow = Date.now();
    let sessionData = {
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

    const expiryDuration = parseInt((Number(new Date)) / 1000) + 1800;// 30minutes ahead of current time
    redisClient.expireat('session:' + sessionToken, expiryDuration);
    redisClient.expireat('session:email:' + entityId, expiryDuration);

    cb(null, sessionToken);
};

/**
 * Get user session stored in database. Return null/empty if no session found.
 * @param token The session token value.
 * @param userEmail The User's email that will be used for searching if there's an existing session token.
 * @returns The session token String.
 */
const getUserSession = function (token, userEmail, cb) {
    let sessionToken = token;
    if (sessionToken !== null) {
        redisClient.hgetall('session:' + sessionToken, function (err, obj) {
            if (err || obj === null) {
                cb(err, obj);
            } else {
                cb(err, sessionToken);
            }
        });
    } else if (userEmail !== null) {
        const entityId = Utils.hmacMd5Encrypt(JSON.stringify(userEmail));
        redisClient.get('session:email:' + entityId, function (err, obj) {
            cb(err, obj);
        });
    } else {
        let err = {};
        cb(err, null);
    }
};

// Reset user session expiry to 30 minutes
const refreshSessionExpiry = function (sessionToken, cb) {
    redisClient.hgetall('session:' + sessionToken, function (err, obj) {
        const entityId = obj.entityId;
        const expiryDuration = parseInt((Number(new Date)) / 1000) + 1800;// 30minutes ahead of current time
        redisClient.expireat('session:' + sessionToken, expiryDuration);
        redisClient.expireat('session:email:' + entityId, expiryDuration);
    });
    cb(null, '');
};

/**
 * Get the details of User with the email.
 * @param userEmail The string email of User details to get.
 * @param cb The callback function when User details has been populated.
 */
const getUserDetails = function (userEmail, cb) {
    redisClient.hgetall('user:' + userEmail, function (err, obj) {
        cb(err, obj);
    });
};

/**
 * Save User object details to Redis database.
 * @param user The User object containing the details.
 */
const writeUserDetails = function (user, cb) {
    let salt = Bcryptjs.genSaltSync(10);
    let hashPwd = Bcryptjs.hashSync(user.password, salt);
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
    cb(null, '');
};

/**
 * Update User password to Redis database.
 * @param userEmail The user's email.
 * @param newPassword The new password to be set.
 */
const updateUserPassword = function (userEmail, newPassword, cb) {
    let salt = Bcryptjs.genSaltSync(10);
    let hashPwd = Bcryptjs.hashSync(newPassword, salt);
    redisClient.HMSET('user:' + userEmail, {
        password: hashPwd
    });
    cb(null, '');
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
