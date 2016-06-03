'use strict';

const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');
const Async = require('async');
const Composer = require('../../server/composer');
const DbQuery = require('../../server/method/db/dbQuery');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;

describe('REST API', () => {


    const userDummy = {
        email: 'juancruz@gmail.com',
        name: 'Juan Cruz',
        birthday: 700488000000,
        gender: 'M',
        password: 'asdf1234'
    };

    const headerDevice = 'Android';
    const headerVersion = '1.0.0';

    function createApiServer(cb) {
        Composer((err, server) => {

            if (err) {
                throw err;
            }

            server.start((err) => {

                if (err) {
                    throw err;
                }

                server.log('info', 'server running at: ' + server.info.uri);
                cb(server);
            });
        });
    }

    describe('User Registration', () => {

        let mockServer;

        before({ timeout: 8000 }, (done) => {

            Sinon.stub(DbQuery, 'writeUserDetails', (userDetails, cb) => {
                cb(null, userDetails);
            });

            Sinon.stub(DbQuery, 'getUserDetails', (userDetails, cb) => {
                cb(null, null);
            });

            createApiServer((server) => {
                mockServer = server;
                done();
            });
        });

        after((done) => {

            DbQuery.getUserDetails.restore();
            DbQuery.writeUserDetails.restore();
            done();
        });

        it('user registration with invalid headers', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/register',
                payload: userDummy
            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid headers.');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user registration with invalid data', { timeout: 1000 }, (done) => {

            Async.series([
                (testFinished) => {

                    const options = {
                        method: 'POST',
                        url: '/user/register',
                        headers: {
                            device: headerDevice,
                            version: headerVersion
                        },
                        payload: {
                            email: userDummy.email,
                            birthday: userDummy.birthday,
                            gender: userDummy.gender,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.result).to.be.an.object();
                        expect(response.statusCode).to.equal(400);
                        expect(response.result.statusCode).to.equal(423);
                        expect(response.result.message).to.include('Invalid name');
                        expect(response.headers['content-type']).to.include('application/json');
                        testFinished();
                    });

                },
                (testFinished) => {

                    const options = {
                        method: 'POST',
                        url: '/user/register',
                        headers: {
                            device: headerDevice,
                            version: headerVersion
                        },
                        payload: {
                            name: userDummy.name,
                            birthday: userDummy.birthday,
                            gender: userDummy.gender,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.result).to.be.an.object();
                        expect(response.statusCode).to.equal(400);
                        expect(response.result.statusCode).to.equal(424);
                        expect(response.result.message).to.include('Invalid email');
                        expect(response.headers['content-type']).to.include('application/json');
                        testFinished();
                    });

                },
                (testFinished) => {

                    const options = {
                        method: 'POST',
                        url: '/user/register',
                        headers: {
                            device: headerDevice,
                            version: headerVersion
                        },
                        payload: {
                            email: userDummy.email,
                            name: userDummy.name,
                            gender: userDummy.gender,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.result).to.be.an.object();
                        expect(response.statusCode).to.equal(400);
                        expect(response.result.statusCode).to.equal(425);
                        expect(response.result.message).to.include('Invalid birthday');
                        expect(response.headers['content-type']).to.include('application/json');
                        testFinished();
                    });

                },
                (testFinished) => {

                    const options = {
                        method: 'POST',
                        url: '/user/register',
                        headers: {
                            device: headerDevice,
                            version: headerVersion
                        },
                        payload: {
                            email: userDummy.email,
                            name: userDummy.name,
                            birthday: userDummy.birthday,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.result).to.be.an.object();
                        expect(response.statusCode).to.equal(400);
                        expect(response.result.statusCode).to.equal(426);
                        expect(response.result.message).to.include('Invalid gender');
                        expect(response.headers['content-type']).to.include('application/json');
                        testFinished();
                    });

                },
                (testFinished) => {

                    const options = {
                        method: 'POST',
                        url: '/user/register',
                        headers: {
                            device: headerDevice,
                            version: headerVersion
                        },
                        payload: {
                            email: userDummy.email,
                            name: userDummy.name,
                            birthday: userDummy.birthday,
                            gender: userDummy.gender
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.result).to.be.an.object();
                        expect(response.statusCode).to.equal(400);
                        expect(response.result.statusCode).to.equal(428);
                        expect(response.result.message).to.include('password invalid');
                        expect(response.headers['content-type']).to.include('application/json');
                        testFinished();
                    });

                }
            ], () => {

                done();
            });
        });

        it('user registration with valid details and headers', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/register',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: userDummy
            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(200);
                expect(response.result.statusCode).to.equal(201);
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });
    });

});
