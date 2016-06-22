'use strict';

const scheme = function (server, options) {

    return {
        authenticate: function (request, reply) {

            const authValidator = server.methods.validationAuth;
            const apiResponse = server.methods.apiResponse;

            const req = request.raw.req;
            const sessionToken = req.headers.token;

            authValidator.validateSession(server, req.headers, (err, obj) => {

                if (err) {
                    return reply(apiResponse.constructApiErrorResponse(401, 401, 'Unauthorized'));
                }

                // Required to return object 'result' with 'credentials' property, and also
                // added the session details retrieved from database
                const result = {
                    credentials: obj
                };
                return reply.continue(result);
            });
        }
    };
};

exports.register = (server, options, next) => {

    server.auth.scheme('authscheme', scheme);
    server.auth.strategy('auth', 'authscheme');

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
