'use strict';

const Validator = require('validator');
const Bcryptjs = require('bcryptjs');

const dbRedis = require('./db_redis');

/**
 * Check if User authentication is valid for login.
 * @param payload The JSON String of credentials object. i.e 
 * {
 *  'email':'dummy@gmail.com',
 *  'password':'P@ssw0rd!',
 *  'role': 'Admin'
 * }
 * @param cb The callback function when User object details has been checked.
 */
const validateAuth = function (payload, cb) {
    let apiError = {
        error_code: 400,
        error_message: 'Invalid login'
    };

    // credentials contains "email","password","role"
    let credentials = JSON.parse(payload);

    if (!payload) {
        // credentials details empty
        cb(apiError, payload, 0);
    } else {
        let passwordChecked = function() {
            let session = '';
            // TODO Create unique user session base on client device, agent, ip
            // TODO Check role if it's a valid one base on defined roles
            dbRedis.getUserSession(credentials.email, function (err, reply) {
                if (err || reply == null || reply == undefined) {
                    // create session if no existing
                    session = dbRedis.createUserSession(credentials.email);
                    cb(null, session, 0);
                } else if (reply.toString()) {
                    session = reply.toString();
                    // refresh session expiry if existing
                    dbRedis.refreshSessionExpiry(credentials.email, session);
                    cb(null, session, 0);
                }
            });
        };
        
        dbRedis.getUserDetails(credentials.email, function (err, obj) {
            if (err) {
                cb(apiError, payload, 0);    
            } else if (obj == null) {
                cb(apiError, payload, 0);
            } else {
                let hashPwd = obj.password;
                Bcryptjs.compare(credentials.password, hashPwd, function(err, res) {
                    if (err || res == false) {
                        // password did not matched, throw err
                        cb(apiError, payload, 0);
                    } else {
                        // password matched
                        passwordChecked(); 
                    }
                });
            }
        });
    }
};

const validateSession = function (session, cb) {
    let err = {
        error_code: 400,
        error_message: 'Invalid session'
    };

    if (!session) {
        // credentials details empty
        cb(err, payload, 0);
    } else {
        // success, user authentication valid
        cb(null, "must return session token", 0);
    }
}

module.exports = {
    validateAuth: validateAuth
};