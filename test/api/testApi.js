'use strict';

const Code = require('code');
const Lab = require('lab');
const Redis = require('redis');
const FakeRedis = require('fakeredis');
const Sinon = require('sinon');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;

describe('REST API', () => {

    const Composer = require('../../server/composer');
    let mockServer;

    const userDummy = {
        email: 'juancruz@gmail.com',
        name: 'Juan Cruz',
        birthday: 700488000000,
        gender: 'M',
        password: 'asdf1234'
    };

    const headerDevice = 'Android', headerVersion = '1.0.0';
    let headerToken;

    before({ timeout: 5000 }, (done) => {

        Sinon.stub(Redis, 'createClient', FakeRedis.createClient);

        Composer((err, server) => {

            if (err) {
                throw err;
            }

            server.start((err) => {

                if (err) {
                    throw err;
                }

                server.log('info', 'server running at: ' + server.info.uri);
                mockServer = server;

                done();
            });
        });
    });

    after((done) => {

        Redis.createClient.restore();
        return done();
    });

    it('check server if object', (done) => {

        expect(mockServer).to.be.an.object();
        return done();
    });

    it('user registration with invalid headers', { timeout: 1000 }, (done) => {

        var options = {
            method: "POST",
            url: "/user/register",
            payload: JSON.stringify(userDummy)
        };

        mockServer.inject(options, function(response) {
            expect(response.result).to.be.an.object();
            expect(response.statusCode).to.equal(400);
            expect(response.result.statusCode).to.equal(400);
            expect(response.result.message).to.include('Invalid headers.');
            expect(response.headers['content-type']).to.include('application/json');
            done();
        });
    });

    it('user registration with valid headers', { timeout: 1000 }, (done) => {

        var options = {
            method: "POST",
            url: "/user/register",
            headers: {
                device: headerDevice,
                version: headerVersion
            },
            payload: JSON.stringify(userDummy)
        };

        mockServer.inject(options, function(response) {
            expect(response.result).to.be.an.object();
            expect(response.statusCode).to.equal(201);
            expect(response.result.statusCode).to.equal(201);
            expect(response.headers['content-type']).to.include('application/json');
            done();
        });
    });

});
