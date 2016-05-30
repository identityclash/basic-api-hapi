'use strict';

const Code = require('code');
const Lab = require('lab');

const Redis = require('redis');
const RedisClient = require('../../server/method/db/redis/redisClient');
const FakeRedis = require('fakeredis');
const Sinon = require('sinon');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;

describe('server/method/db/redis', () => {

    let client;

    const user = {
        email: 'juancruz@gmail.com',
        name: 'Juan Cruz',
        birthday: 700488000000,
        gender: 'M',
        password: '$2a$10$bFpG1q02pctraHp./YqGO.kV6yufToGITE0DYUSnXkA0id6G2w.2G',
    };

    const device = 'Android', version = '1.0.0';

    before((done) => {

        Sinon.stub(Redis, 'createClient', FakeRedis.createClient);
        client = Redis.createClient();
        return done();
    });

    after((done) => {

        Redis.createClient.restore();
        return done();
    });

    let sessionToken;
    it('create user session', (done) => {

        RedisClient.createUserSession(device, version, user.email, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.a.string();
            sessionToken = obj;
        });
        return done();
    });

    it('get existing user session', (done) => {

        RedisClient.getUserSession(sessionToken, null, (err, obj) => {

            expect(err).to.be.null()
            expect(obj).to.be.a.string();
        });
        return done();
    });

    it('get existing user session using email', (done) => {

        RedisClient.getUserSession(null, user.email, (err, obj) => {

            expect(err).to.be.null()
            expect(obj).to.be.a.string();
        });
        return done();
    });

    it('get non-existing user session', (done) => {

        // Get non-existing user session and return err
        RedisClient.getUserSession('1234567890', null, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.null();
        });
        return done();
    });

    it('get existing user session without passed parameters', (done) => {

        RedisClient.getUserSession(null, null, (err, obj) => {

            expect(err).to.be.an.object();
            expect(obj).to.be.null();
        });
        return done();
    });

    it('refresh session expiry', (done) => {

        RedisClient.refreshSessionExpiry(sessionToken, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.a.string();
        });
        return done();
    });

    it('write user details', (done) => {

        RedisClient.writeUserDetails(user, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.an.object();
            expect(obj.email).to.equal(user.email);
        });
        return done();
    });

    it('get user details', (done) => {

        RedisClient.getUserDetails(user.email, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.an.object();
        });
        return done();
    });

    it('update user details', (done) => {

        user.name = 'Juan';
        RedisClient.updateUserDetails(user, (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.an.object();
            expect(obj.name).to.equal(user.name);
        });
        return done();
    });

    it('update user password', (done) => {

        RedisClient.updateUserPassword(user.email, 'n3wP@ssw0rd', (err, obj) => {

            expect(err).to.be.null();
            expect(obj).to.be.a.string();
        });
        return done();
    });
    
});
