// This file is only an experiment of hapi.js usage

'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.app.alias = 'GoClass';

const users = {
	john: {
		username: 'john',
		password: '',
		name: 'John Doe',
		id: '1001'
	}
};

const validate = function(request, username, password, callback) {
	const user = users[username];
	if (!user) {
		return callback(null, false);
	}	
	
	Bcrypt.compare(password, user.password, (err, isValid) => {
		callback(err, isValid, { id: user.id, name: user.name, });
	});
};

function initUserCredentials() {
	var salt = Bcrypt.genSaltSync(10);
	Bcrypt.hash("password", salt, function(err, hash) {
		// the 'hash' parameter is now the encrypted string value of "password"
		users.john.password = hash;
	});
};

server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		reply('Hello, world! ' + request.server.app.alias);
	}
});

server.route({
	method: 'GET',
	path: '/{name}',
	handler: function (request, reply) {
		reply('Hello,' + encodeURIComponent(request.params.name) + '!');
	}
});

// displaying static page
server.register(require('inert'), (err) => {

	if (err) {
		throw err;
	}

	server.route({
		method: 'GET',
		path: '/hello',
		handler: function (request, reply) {
			reply.file('./public/hello.html');
		}
	});
});

server.register(Basic, (err) => {
	initUserCredentials();
	server.auth.strategy('simple', 'basic', { validateFunc: validate });
	server.route({
		method: 'GET',
		path: '/login',
		config: {
			auth: 'simple',
			handler: function (request, reply) {
				reply('Hello ' + request.auth.credentials.name);
			}
		}
	})
});


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
		server.log('info', 'server id: ' + server.info.id);
		server.log('info', 'server start: ' + server.info.started);
		server.log('info', 'server uri: ' + server.info.uri);
    });
});