'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Glue = require('glue');

const manifest = require('./config/manifest.json');
const options = {
  relativeTo: __dirname
};

Glue.compose(manifest, options, function (err, server) {
    
	server.register({
	    register: Good,
	    options: {
	            reporters: [{
	                reporter: require('good-console'),
	                events: {
	                    response: '*',
	                    log: '*'
	                }
	            }]
	        }
	    }, (err) => {

	        if (err) {
	            throw err; // something bad happened loading the plugin
	        }

	        server.start((err) => {

	            if (err) {
	                throw err;
	            }
	            server.log('info', 'server running at: ' + server.info.uri);
	        });
	});
});

