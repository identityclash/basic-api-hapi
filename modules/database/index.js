'use strict';

const Redis = require('redis');
const Bcryptjs = require('bcryptjs');
const CryptoJS = require('crypto-js');

const utils = require('../../utility/util');

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
    
    const dateNow = Date.now();

    let sessionData = {
        'entityId': entityId,
        'email': userEmail,
        'device': headers.goclassdevice,
        'version': headers.goclassversion,
        'dateCreated': dateNow
    };

    const sessionToken = utils.hmacMd5Encrypt(JSON.stringify(sessionData));

    redisClient.HMSET('session:' + sessionToken, {
        'entityId': entityId,
        'email': userEmail,
        'device': headers.goclassdevice,
        'version': headers.goclassversion,
        'dateCreated': dateNow
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
    let sessionToken = headers.goclasstoken;
    
    if (sessionToken != null) {
        redisClient.hgetall('session:' + sessionToken, function (err, obj) {
            if (err || obj == null) {
                cb(err, obj);
            } else {
                cb(err, sessionToken);
            }
        });
        
    } else if (userEmail != null) {
        const entityId = utils.hmacMd5Encrypt(JSON.stringify(userEmail));
        redisClient.get('session:email:' + entityId, function (err, obj) {
            cb(err, obj);
        });
        
    } else {
        let err = {};
        cb(err, null);
        
    }
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
    
    const entityId = utils.hmacMd5Encrypt(user.userEmail);
    
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


exports.register = function (server, options, next) {

    server.method('db.createUserSession', createUserSession);
    server.method('db.getUserSession', getUserSession);
    server.method('db.refreshSessionExpiry', refreshSessionExpiry);
    server.method('db.getUserDetails', getUserDetails);    
    server.method('db.writeUserDetails', writeUserDetails);  
    server.method('db.updateUserDetails', updateUserDetails);
    server.method('db.updateUserPassword', updateUserPassword);

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
