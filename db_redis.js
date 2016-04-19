'use strict';

const Redis = require('redis');

const redisClient = Redis.createClient();

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

/**
 * Save User object details to Redis database.
 * @param user The User object containing the details.
 */
const writeUserDetails = function(user) {
    redisClient.HMSET('user:' + user.email, {
        "email" : user.email,
        "name": user.name,
        "birthday": user.birthday,
        "gender": user.gender
    });  
};

/** 
 * Get the details of User with the email.
 * @param userEmail The string email of User details to get.
 * @param cb The callback function when User details has been populated.
 */
const getUserDetails = function(userEmail, cb) {
    redisClient.hgetall('user:' + userEmail, function(err, obj) {
        cb(err, obj);
    });
};

module.exports = {
    writeUserDetails: writeUserDetails,
    getUserDetails: getUserDetails
};