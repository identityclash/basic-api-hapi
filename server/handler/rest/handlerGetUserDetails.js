'use strict';

const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;

        // request.auth is the server.auth strategy
        const sessionDetails = request.auth.credentials;

        const email = sessionDetails.email;
        server.methods.dbQuery.getUserDetails(decodeURIComponent(email), (err, obj) => {

            if (err) {
                server.log('error', '/user ' + email + ' ' + err);
                reply(apiResponse.getUnexpectedApiError());
            }
            else if (Lodash.isEmpty(obj)) {
                reply(apiResponse.getUserNonExistentError());
            }
            else {
                // Remove 'password' property in response
                const user = Lodash.clone(obj);
                delete user.password;
                reply(user);
            }
        });
    };

};
