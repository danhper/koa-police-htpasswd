'use strict';

const fs            = require('fs');
const assert        = require('assert');
const checkPassword = require('htpasswd').verify;

const parseHtpasswd = function (content) {
  let users = {};
  for (let line of content.trim().split(/\r?\n/)) {
    line = line.trim();
    if (line.length > 0) {
      let info = line.split(':');
      assert(info.length === 2, 'bad htpasswd file format: ' + content);
      users[info[0]] = info[1];
    }
  }
  return users;
};

const getInfo = function (header) {
  if (!header) {
    return false;
  }
  let parts = header.split(' ');
  if (parts[0] !== 'Basic' || !parts[1]) {
    return false;
  }
  let info = new Buffer(parts[1], 'base64').toString().split(':');
  if (info.length !== 2) {
    return false;
  }
  return {username: info[0], password: info[1]};
};

const normalizeScope = function (scopeContent, options) {
  if (options.loadFile) {
    scopeContent = fs.readFileSync(scopeContent, 'utf8');
  }
  return parseHtpasswd(scopeContent);
};

module.exports = function (scopes, options) {
  scopes = scopes || {};
  options = options || {};

  for (let scope in scopes) {
    if (scopes.hasOwnProperty(scope) && typeof scopes[scope] === 'string') {
      scopes[scope] = normalizeScope(scopes[scope], options);
    }
  }

  return {
    name: 'htpasswd',
    authenticate: function *(context, scope) {
      let info = getInfo(context.request.header.authorization);
      if (!scopes[scope] || !info || !scopes[scope][info.username]) {
        return false;
      }
      let passwordHash = scopes[scope][info.username];
      if (checkPassword(passwordHash, info.password)) {
        return info.username;
      }
      return false;
    }
  };
};
