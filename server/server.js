'use strict';

const Glue = require('glue');

const Manifest = require('../config/manifest.json');
const options = {
    relativeTo: __dirname
};

Glue.compose(Manifest, options, (err, server) => {

    if (err) {
        throw err;
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'server running at: ' + server.info.uri);
    });
});
