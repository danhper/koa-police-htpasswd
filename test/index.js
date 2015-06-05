'use strict';

const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;
const co     = require('co');
const path   = require('path');

const koaPoliceHtpasswd = require('..');

const strategy = koaPoliceHtpasswd({
  user: path.join(__dirname, 'users.htpasswd'),
  admin: path.join(__dirname, 'admin.htpasswd')
}, {loadFile: true});

const withAuthorization = function (hash) {
  beforeEach(function () {
    this.ctx.request.header.authorization = 'Basic ' + hash;
  });
};

describe('koa-police-htpasswd', function () {
  beforeEach(function () {
    this.ctx = {request: {header: {}}};
  });

  context('with not authorization header', function () {
    it('should return false', function () {
      let result = co(strategy.authenticate(this.ctx, 'whatever'));
      expect(result).to.eventually.be.false;
    });
  });

  context('with inexisting scope', function () {
    withAuthorization('Zm9vYmFyOmJhcmJheg==');

    it('should return false', function () {
      let result = co(strategy.authenticate(this.ctx, 'inexisting-scope'));
      expect(result).to.eventually.be.false;
    });
  });

  context('with inexisting user', function () {
    withAuthorization('Zm9vYmFyOmJhcmJheg==');
    it('should return false', function () {
      let result = co(strategy.authenticate(this.ctx, 'user'));
      expect(result).to.eventually.be.false;
    });
  });

  context('with bad password', function () {
    withAuthorization('dXNlcjE6YmFyYmF6');
    it('should return false', function () {
      let result = co(strategy.authenticate(this.ctx, 'user'));
      expect(result).to.eventually.be.false;
    });
  });

  context('with correct password', function () {
    let users = {user1: 'dXNlcjE6cGFzc3dvcmQ=', user2: 'dXNlcjI6MTIzNDU2Nzg='};

    for (let username of Object.keys(users)) {
      withAuthorization(users[username]);
      it('should return username', function () {
        let result = co(strategy.authenticate(this.ctx, 'user'));
        expect(result).to.eventually.equal(username);
      });
    }
  });

  context('with bad scope', function () {
    withAuthorization('dXNlcjE6cGFzc3dvcmQ=');
    it('should return false', function () {
      let result = co(strategy.authenticate(this.ctx, 'admin'));
      expect(result).to.eventually.equal(false);
    });
  });

  context('with non default scope and correct info', function () {
    withAuthorization('YWRtaW4xOmZvb2JhcmJheg==');
    it('should return username', function () {
      let result = co(strategy.authenticate(this.ctx, 'admin'));
      expect(result).to.eventually.equal('admin1');
    });
  });
});
