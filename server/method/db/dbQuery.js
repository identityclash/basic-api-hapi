'use strict';

const Lodash = require('lodash');
const RedisClient = require('./redis/redisClient');
const Manifest = require('../../manifest');

const dbClient = function () {

    const env = Manifest.get('/env');
    const dbType = Manifest.get('/database', { db: env });

    const dbRedis = RedisClient;

    if (Lodash.isEqual(dbType, 'redis')) {
        return dbRedis;
    }
    return dbRedis;
};

module.exports = {
    createUserSession: function (device, version, userEmail, cb) {
        dbClient().createUserSession(device, version, userEmail, (err, obj) => {
            cb(err, obj);
        });
    },
    getUserSession: function (token, userEmail, cb) {
        RedisClient.getUserSession(token, userEmail, (err, obj) => {
            cb(err, obj);
        });
    },
    refreshSessionExpiry: function (token, cb) {
        dbClient().refreshSessionExpiry(token, (err, obj) => {
            cb(err, obj);
        });
    },
    getUserDetails: function (userEmail, cb) {
        dbClient().getUserDetails(userEmail, (err, obj) => {
            cb(err, obj);
        });
    },
    writeUserDetails: function (userDetails, cb) {
        dbClient().writeUserDetails(userDetails, (err, obj) => {
            cb(err, obj);
        });
    },
    updateUserDetails: function (userDetails, cb) {
        dbClient().updateUserDetails(userDetails, (err, obj) => {
            cb(err, obj);
        });
    },
    updateUserPassword: function (userEmail, newPassword, cb) {
        dbClient().updateUserPassword(userEmail, newPassword, (err, obj) => {
            cb(err, obj);
        });
    }
};
