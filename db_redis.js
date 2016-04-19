'use strict';

const Redis = require('redis');
const Bcryptjs = require('bcryptjs');

const redisClient = Redis.createClient();

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

// Get user session stored in database. Return null/empty if no session found.
const getUserSession = function (email, cb) {
    redisClient.get('session:' + email, function (err, reply) {
        cb(err, reply);
    });
}

// Create user session if not exist else refresh expiry
const createUserSession = function (email) {

    var salt = Bcryptjs.genSaltSync(10);
    var hash = Bcryptjs.hashSync(Date.now().toString(), salt);

    redisClient.set('session:' + email, hash);
    redisClient.expire('session:' + email, 10);

    return hash;
}

// Reset user session expiry to 30 minutes
const refreshSessionExpiry = function (email, session) {
    redisClient.set('session:' + email, session);
    redisClient.expire('session:' + email, 10);
}

/**
 * Save User object details to Redis database.
 * @param user The User object containing the details.
 */
const writeUserDetails = function (user) {
    let salt = Bcryptjs.genSaltSync(10);
    let hashPwd = Bcryptjs.hashSync(user.password, salt);
    redisClient.HMSET('user:' + user.email, {
        "email": user.email,
        "name": user.name,
        "birthday": user.birthday,
        "gender": user.gender,
        "password": hashPwd
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

module.exports = {
    getUserSession: getUserSession,
    createUserSession: createUserSession,
    refreshSessionExpiry: refreshSessionExpiry,
    writeUserDetails: writeUserDetails,
    getUserDetails: getUserDetails
};