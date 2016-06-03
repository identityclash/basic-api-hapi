'use strict';

const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;

        const userEmail = encodeURIComponent(request.params.email);
        server.methods.dbQuery.getUserDetails(decodeURIComponent(userEmail), (err, obj) => {

            if (err) {
                server.log('error', '/user/' + request.params.email + ' ' + err);
                reply(apiResponse.getUnexpectedApiError());
            }
            else if (Lodash.isEmpty(obj)) {
                reply(apiResponse.getUserNonExistentError());
            }
            else {
                // Remove 'password' property in response
                delete obj.password;
                reply(obj);
            }
        });
    };

};
