'use strict';

const Code = require('code');
const Lab = require('lab');
const Utility = require('../../server/utility/util');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

describe('server/utility/util', () => {

    it('returns hashMD5', (done) => {

        expect(Utility.hmacMd5Encrypt('test string')).to.be.a.string();

        return done();
    });
});
