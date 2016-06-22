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
        path: '/user',
        method: 'GET',
        config: {
            auth: 'auth',
            handler: {
                handlerGetUserDetails: {}
            }
        }
    },
    {
        path: '/user',
        method: 'POST',
        config: {
            auth: 'auth',
            handler: {
                handlerUpdateUserDetails: {}
            }
        }
    },
    {
        path: '/user/password',
        method: 'POST',
        config: {
            auth: 'auth',
            handler: {
                handlerChangePassword: {}
            }
        }
    }
];
