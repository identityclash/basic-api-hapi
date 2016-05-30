'use strict';

const Lodash = require('lodash');

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const apiResponse = server.methods.apiResponse;

        let userEmail = encodeURIComponent(request.params.email);
        server.methods.dbQuery.getUserDetails(decodeURIComponent(userEmail), (err, obj) => {

            if (err) {
                server.log('error', '/user/' + request.params.email + ' ' + err);
                reply(apiResponse.getUnexpectedApiError());
            } else if (Lodash.isEmpty(obj)) {
                reply(apiResponse.getUserNonExistentError());
            } else {
                delete obj.password;// remove 'password' property in response
                reply(JSON.stringify(obj)).type('application/json');
            }
        });
    };

};
