'use strict';

const Glue = require('glue');

const manifest = require('../config/manifest.json');
const options = {
  relativeTo: __dirname
};

Glue.compose(manifest, options, function (err, server) {

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
