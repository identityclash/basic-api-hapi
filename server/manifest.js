'use strict';

const Confidence = require('confidence');

const manifest = {
    '$meta': 'The env defines the selected configuration like for database client to use.',
    env: 'dev',
    api: {
        server: {},
        connections: [
            {
                port: 3000,
                labels: ['api'],
                routes: {
                    files: { relativeTo: process.cwd() + '/static' }
                }
            }
        ],
        registrations: [
            { plugin: 'inert' },
            {
                plugin: {
                    register: 'errorh',
                    options: {
                        errorFiles: {
                            404: '404.html',
                            default: '50x.html'
                        },
                        staticRoute: {
                            path: '/{path*}',
                            method: '*',
                            handler: {
                                directory: {
                                    path: './',
                                    index: true,
                                    redirectToSlash: true
                                }
                            }
                        }
                    }
                }
            },
            {
                plugin: {
                    register: './authentication'
                }
            },
            {
                plugin: {
                    register: 'acquaint',
                    options: {
                        methods: [
                            { includes: ['server/method/response/*js'] },
                            { includes: ['server/method/db/*.js'] },
                            { includes: ['server/method/validation/*.js'] }
                        ],
                        handlers: [
                            { includes: ['server/handler/**/*.js'] }
                        ],
                        routes: [
                            { includes: ['server/route/**/*.js'] }
                        ]
                    }
                }
            },
            {
                plugin: {
                    register: 'good',
                    options: {
                        reporters: {
                            console: [
                                {
                                    module: 'good-squeeze',
                                    name: 'Squeeze',
                                    args: [{
                                        ops: '*',
                                        log: '*',
                                        error: '*',
                                        response: '*'
                                    }]
                                },
                                { module: 'good-console' },
                                'stdout'
                            ]
                        }
                    }
                }
            }
        ]
    },
    database: {
        '$filter': 'db',
        dev: 'redis',
        prod: 'mongodb'
    }
};

const store = new Confidence.Store(manifest);

exports.get = (key, criteria) => {
    return store.get(key, criteria);
};
