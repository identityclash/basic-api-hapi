'use strict';

const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');
const Async = require('async');
const Composer = require('../../server/composer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;

describe('REST API', () => {

    let mockServer;

    const userDummy = {
        email: 'juancruz@gmail.com',
        name: 'Juan Cruz',
        birthday: 700488000000,
        gender: 'M',
        password: 'asdf1234'
    };

    const headerDevice = 'Android';
    const headerVersion = '1.0.0';
    const headerSessionToken = 'dummySessionToken';

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

    before({ timeout: 8000 }, (done) => {

        createApiServer((server) => {

            mockServer = server;
            done();
        });
    });

    after((done) => {

        mockServer.stop((err) => {

            if (err) {
                console.log('Error stopping server instance!');
            }
        });

        done();
    });

    describe('User registration', () => {

        before((done) => {

            Sinon.stub(mockServer.methods.dbQuery, 'writeUserDetails', (userDetails, cb) => {

                cb(null, userDetails);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userDetails, cb) => {

                cb(null, null);
            });

            done();
        });

        after((done) => {

            mockServer.methods.dbQuery.getUserDetails.restore();
            mockServer.methods.dbQuery.writeUserDetails.restore();
            done();
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

        it('user registration with error in database query getUserDetails', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/register',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: userDummy
            };

            mockServer.methods.dbQuery.getUserDetails.restore();

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userDetails, cb) => {
                cb({ error: 'dummy error message' }, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user registration with error in database query writeUserDetails', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/register',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: userDummy
            };

            mockServer.methods.dbQuery.getUserDetails.restore();
            mockServer.methods.dbQuery.writeUserDetails.restore();

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userDetails, cb) => {
                cb(null, null);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'writeUserDetails', (userDetails, cb) => {
                cb({ error: 'test error'}, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user registration with email existing', { timeout: 1000 }, (done) => {

            mockServer.methods.dbQuery.getUserDetails.restore();

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userDetails, cb) => {
                cb(null, userDummy);
            });

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
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Email already taken');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });
    });

    describe('User get details', () => {

        before((done) => {
            Sinon.stub(mockServer.methods.dbQuery, 'getUserSession', (token, userEmail, cb) => {

                cb(null, headerSessionToken);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'refreshSessionExpiry', (sessionToken, cb) => {

                cb(null, headerSessionToken);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb(null, userDummy);
            });

            done();
        });

        after((done) => {

            mockServer.methods.dbQuery.getUserSession.restore();
            mockServer.methods.dbQuery.refreshSessionExpiry.restore();
            mockServer.methods.dbQuery.getUserDetails.restore();
            done();
        });

        it('user get details with valid details and headers', { timeout: 1000 }, (done) => {

            const options = {
                method: 'GET',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                },
                headers: {
                    device: headerDevice,
                    version: headerVersion,
                    token: headerSessionToken
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.result.email).to.equal(userDummy.email);
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user get details with invalid details and headers', { timeout: 1000 }, (done) => {

            const options = {
                method: 'GET',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(401);
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user get details with error in database query get user details ', { timeout: 1000 }, (done) => {

            const options = {
                method: 'GET',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                },
                headers: {
                    device: headerDevice,
                    version: headerVersion,
                    token: headerSessionToken
                }
            };

            mockServer.methods.dbQuery.getUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb({ error: 'dummy error message' }, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user get details of unexisting user', { timeout: 1000 }, (done) => {

            const options = {
                method: 'GET',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                },
                headers: {
                    device: headerDevice,
                    version: headerVersion,
                    token: headerSessionToken
                }
            };

            mockServer.methods.dbQuery.getUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb(null, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(404);
                expect(response.result.statusCode).to.equal(404);
                expect(response.result.message).to.include('User non-existent');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });
    });

    describe('User update details', () => {

        before((done) => {
            Sinon.stub(mockServer.methods.dbQuery, 'getUserSession', (token, userEmail, cb) => {

                cb(null, headerSessionToken);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'refreshSessionExpiry', (sessionToken, cb) => {

                cb(null, headerSessionToken);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb(null, userDummy);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'updateUserDetails', (userEmail, cb) => {

                cb(null, userDummy);
            });

            done();
        });

        after((done) => {

            mockServer.methods.dbQuery.getUserSession.restore();
            mockServer.methods.dbQuery.refreshSessionExpiry.restore();
            mockServer.methods.dbQuery.getUserDetails.restore();
            mockServer.methods.dbQuery.updateUserDetails.restore();
            done();
        });

        it('user update details with valid details and headers', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                },
                headers: {
                    device: headerDevice,
                    version: headerVersion,
                    token: headerSessionToken
                },
                payload: {
                    name: userDummy.name,
                    birthday: userDummy.birthday
                }

            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user update details with invalid name', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/user/{email}',
                params: {
                    email: userDummy.email
                },
                headers: {
                    device: headerDevice,
                    version: headerVersion,
                    token: headerSessionToken
                },
                payload: {
                    name: '!@#$%^&*()',
                    birthday: userDummy.birthday
                }

            };

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.statusCode).to.equal(400);
                expect(response.result.statusCode).to.equal(423);
                expect(response.result.message).to.include('Invalid name');
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });
    });
});
