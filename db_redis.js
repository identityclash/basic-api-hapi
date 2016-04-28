'use strict';

const Redis = require('redis');
const Bcryptjs = require('bcryptjs');// pasword encyption
const CryptoJS = require('crypto-js');// session creation
const utils = require('./utils');

const redisClient = Redis.createClient();

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

/** 
 * Create user session with expiry of 30 minutes.
 * @param headers The request header object containing 'GoClassToken', 'GoClassDevice', and 'GoClassVersion'.
 */
const createUserSession = function (headers, userEmail) {
    const entityId = utils.hmacMd5Encrypt(JSON.stringify(userEmail));
    
    let sessionData = {
        'entityId': entityId,
        'email': userEmail,
        'device': headers.goclassdevice,
        'version': headers.goclassversion
    };

    const sessionToken = utils.hmacMd5Encrypt(JSON.stringify(sessionData));

    redisClient.HMSET('session:' + sessionToken, {
        'entityId': sessionData.entityId,
        'email': sessionData.email,
        'device': sessionData.device,
        'version': sessionData.version,
        'dateCreated': Date.now()
    });
    
    redisClient.set('session:email:' + entityId, sessionToken);
    
    const expiryDuration = parseInt((+new Date)/1000) + 1800;// 30minutes ahead of current time
    
    redisClient.expireat('session:' + sessionToken, expiryDuration);
    redisClient.expireat('session:email:' + entityId, expiryDuration);
    
    return sessionToken;
};

/**
 * Get user session stored in database. Return null/empty if no session found.
 * @param headers The request header object containing 'GoClassToken', 'GoClassDevice', and 'GoClassVersion'.
 * @param userEmail The User's email that will be used for searching if there's an existing session token.
 * @returns The session token String.
 */
const getUserSession = function (headers, userEmail, cb) {
    var sessionData = {};
    let sessionToken = '';

    const entityId = utils.hmacMd5Encrypt(JSON.stringify(userEmail));

    if (!headers.goclasstoken) {
        sessionData = {
            'entityId': entityId,
            'email': userEmail,
            'device': headers.goclassdevice,
            'version': headers.goclassversion,
            'dateCreated': Date.now()
        };
        
        sessionToken = utils.hmacMd5Encrypt(JSON.stringify(sessionData));
    } else {
        sessionToken = headers.goclasstoken;
    }

    redisClient.hgetall('session:' + sessionToken, function (err, obj) {
        if (err || obj == null) {
            cb(err, obj);
        } else {
            cb(err, sessionToken);
        }
    });
};

// Reset user session expiry to 30 minutes
const refreshSessionExpiry = function (sessionToken) {
    redisClient.hgetall('session:' + sessionToken, function (err, obj) {
        var entityId = obj.entityId;
        
        const expiryDuration = parseInt((+new Date)/1000) + 1800;// 30minutes ahead of current time
        
        redisClient.expireat('session:' + sessionToken, expiryDuration);
        redisClient.expireat('session:email:' + entityId, expiryDuration);
    });
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
const writeUserDetails = function (user) {
    let salt = Bcryptjs.genSaltSync(10);
    let hashPwd = Bcryptjs.hashSync(user.password, salt);
    
    const entityId = utils.hmacMd5Encrypt(JSON.stringify(userEmail));
    
    redisClient.HMSET('user:' + user.email, {
        'entityId': entityId,
        'email': user.email,
        'name': user.name,
        'birthday': user.birthday,
        'gender': user.gender,
        'password': hashPwd
    });
};

/**
 * Update User details to Redis database.
 * @param user The User object containing the details.
 */
const updateUserDetails = function (user) {
    redisClient.HMSET('user:' + user.email, {
        'name': user.name,
        'birthday': user.birthday
    });
};

/**
 * Update User password to Redis database.
 * @param user The User object containing the password.
 */
const updateUserPassword = function (userEmail, password) {
    let salt = Bcryptjs.genSaltSync(10);
    let hashPwd = Bcryptjs.hashSync(password, salt);
    redisClient.HMSET('user:' + userEmail, {
        'password': hashPwd
    });
};


module.exports = {
    getUserSession: getUserSession,
    createUserSession: createUserSession,
    refreshSessionExpiry: refreshSessionExpiry,
    getUserDetails: getUserDetails,
    writeUserDetails: writeUserDetails,
    updateUserDetails: updateUserDetails,
    updateUserPassword: updateUserPassword
};