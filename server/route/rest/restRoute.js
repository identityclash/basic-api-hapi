'use strict';

module.exports = [
    {
        path: '/auth/user',
        method: 'POST',
        handler: {
            handlerAuth: {}
        }
    },
    {
        path: '/user/register',
        method: 'POST',
        handler: {
            handlerRegister: {}
        }
    },
    {
        path: '/user/{email}',
        method: 'GET',
        config: {
            auth: 'auth',
            handler: {
                handlerGetUserDetails: {}
            }
        }
    },
    {
        path: '/user/{email}',
        method: 'POST',
        config: {
            auth: 'auth',
            handler: {
                handlerUpdateUserDetails: {}
            }
        }
    },
    {
        path: '/user/{email}/password',
        method: 'POST',
        config: {
            auth: 'auth',
            handler: {
                handlerChangePassword: {}
            }
        }
    }
];
