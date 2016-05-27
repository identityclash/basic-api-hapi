'use strict';

module.exports = [
    {
        path: '/{path*}',
        method: '*',
        handler: {
            rootHandler: {
                type: 'notfound'
            }
        }
    },
    {
        path: '/',
        method: 'get',
        handler: {
            rootHandler: {
                type: 'index'
            }
        }
    }
];
