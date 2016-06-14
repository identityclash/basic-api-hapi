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

    const userDummyHashPassword = '$2a$10$wLlz8g1AWP4AKgum7RB.Uu3txfS31a.EkakniCQNLRZcpwodqWnMm';

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
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(201);
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
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid headers.');
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
                        payload: {}
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.statusCode).to.equal(400);
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(422);
                        expect(response.result.message).to.include('User details invalid');
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
                            birthday: userDummy.birthday,
                            gender: userDummy.gender,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.statusCode).to.equal(400);
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(423);
                        expect(response.result.message).to.include('Invalid name');
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
                        expect(response.statusCode).to.equal(400);
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(424);
                        expect(response.result.message).to.include('Invalid email');
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
                        expect(response.statusCode).to.equal(400);
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(425);
                        expect(response.result.message).to.include('Invalid birthday');
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
                            birthday: 1000,
                            gender: userDummy.gender,
                            password: userDummy.password
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.statusCode).to.equal(400);
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(425);
                        expect(response.result.message).to.include('Invalid birthday');
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
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.statusCode).to.equal(400);
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(426);
                        expect(response.result.message).to.include('Invalid gender');
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
                        expect(response.statusCode).to.equal(400);
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(428);
                        expect(response.result.message).to.include('password invalid');
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
                            gender: userDummy.gender,
                            password: '!@#$%^&*'
                        }
                    };

                    mockServer.inject(options, (response) => {
                        expect(response.headers['content-type']).to.include('application/json');
                        expect(response.statusCode).to.equal(400);
                        expect(response.result).to.be.an.object();
                        expect(response.result.statusCode).to.equal(428);
                        expect(response.result.message).to.include('password invalid');
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
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
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
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
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
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.statusCode).to.equal(400);
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Email already taken');
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
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                done();
            });
        });
    });

    describe('User login', () => {

        before((done) => {

            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                const userDummySaved = {
                    email: userDummy.email,
                    name: userDummy.name,
                    gender: userDummy.gender,
                    birthday: userDummy.birthday,
                    password: userDummyHashPassword
                };
                cb(null, userDummySaved);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'getUserSession', (token, userEmail, cb) => {

                cb(null, '');
            });

            Sinon.stub(mockServer.methods.dbQuery, 'refreshSessionExpiry', (sessionToken, cb) => {

                cb(null, headerSessionToken);
            });

            Sinon.stub(mockServer.methods.dbQuery, 'createUserSession', (device, version, email, cb) => {

                cb(null, headerSessionToken);
            });

            done();
        });

        after((done) => {

            mockServer.methods.dbQuery.getUserDetails.restore();
            mockServer.methods.dbQuery.getUserSession.restore();
            mockServer.methods.dbQuery.refreshSessionExpiry.restore();
            mockServer.methods.dbQuery.createUserSession.restore();
            done();
        });

        it('user login with valid headers and payload', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.session).to.equal(headerSessionToken);
                done();
            });
        });

        it('user login with required headers empty', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid headers.');
                done();
            });
        });

        it('user login with payload empty', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid login');
                done();
            });
        });

        it('user login with invalid login details', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: 'wrongPassword'
                }
            };

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid login');
                done();
            });
        });

        it('user login with database query create user session returned empty', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.methods.dbQuery.createUserSession.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'createUserSession', (device, version, email, cb) => {

                cb(null, '');
            });
            
            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid login');
                done();
            });
        });

        it('user login with existing user session in database query get user session', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.methods.dbQuery.getUserSession.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserSession', (token, email, cb) => {

                cb(null, headerSessionToken);
            });

            mockServer.methods.dbQuery.refreshSessionExpiry.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'refreshSessionExpiry', (token, cb) => {

                cb(null, headerSessionToken);
            });

            mockServer.inject(options, (response) => {
                expect(response.result).to.be.an.object();
                expect(response.result.session).to.equal(headerSessionToken);
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                done();
            });
        });

        it('user login with error in database query get user details', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.methods.dbQuery.getUserSession.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserSession', (token, email, cb) => {

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

        it('user login with empty result in database query get user details', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
                }
            };

            mockServer.methods.dbQuery.getUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb(null, '');
            });

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Invalid login');
                done();
            });
        });

        it('user login with error in database query get user details', { timeout: 1000 }, (done) => {

            const options = {
                method: 'POST',
                url: '/auth/user',
                headers: {
                    device: headerDevice,
                    version: headerVersion
                },
                payload: {
                    email: userDummy.email,
                    password: userDummy.password
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
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
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
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(423);
                expect(response.result.message).to.include('Invalid name');
                done();
            });
        });

        it('user update details with error in database query update user details', { timeout: 1000 }, (done) => {

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

            mockServer.methods.dbQuery.updateUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'updateUserDetails', (userEmail, cb) => {

                cb({ error: 'dummy error message' }, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                done();
            });
        });

        it('user update details with error in database query get user details', { timeout: 1000 }, (done) => {

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

            mockServer.methods.dbQuery.getUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb({ error: 'dummy error message' }, null);
            });

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(400);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(400);
                expect(response.result.message).to.include('Unexpected API error.');
                done();
            });
        });

        it('user update details of non-existent user', { timeout: 1000 }, (done) => {

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

            mockServer.methods.dbQuery.getUserDetails.restore();
            Sinon.stub(mockServer.methods.dbQuery, 'getUserDetails', (userEmail, cb) => {

                cb(null, '');
            });

            mockServer.inject(options, (response) => {
                expect(response.statusCode).to.equal(404);
                expect(response.headers['content-type']).to.include('application/json');
                expect(response.result).to.be.an.object();
                expect(response.result.statusCode).to.equal(404);
                expect(response.result.message).to.include('User non-existent');
                done();
            });
        });
    });
});
