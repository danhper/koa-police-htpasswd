# koa-police-htpasswd

[![npm version](https://badge.fury.io/js/koa-police-htpasswd.svg)](http://badge.fury.io/js/koa-police-htpasswd)
[![Build Status](https://travis-ci.org/tuvistavie/koa-police-htpasswd.svg)](https://travis-ci.org/tuvistavie/koa-police-htpasswd) [![Coverage Status](https://coveralls.io/repos/tuvistavie/koa-police-htpasswd/badge.svg?coveralls)](https://coveralls.io/r/tuvistavie/koa-police-htpasswd)

A [koa-police](https://github.com/tuvistavie/koa-police) strategy using an `htpasswd` file to provide user and passwords.

## Installation

Simply run

```sh
$ npm install --save koa-police-htpasswd
```

## Usage

This module exports a function that take the scopes and their
related `htpasswd` files as an object, and returns a `koa-police` strategy.
You can call it like this.

```javascript
var koaPoliceHtpasswd = require('koa-police-htpasswd');
var htpasswdStrategy = koaPoliceHtpasswd({
  user: path.join(__dirname, 'users.htpasswd')
}, {loadFile: true});
```

If `loadFile` is true, the passed string will be considered to be
the path on your filesystem, otherwise it will be considered to be the
content of the `htpasswd` file.

You then only need to add this strategy to the `strategies` array when
initializing `koa-police`.
A full example is provided in [the example directory](./example).

## Asking the password when working in browser

`koa-police` is meant to be minimal, and therefore does not handle
adding `www-authenticate` header.
However, you can do this very easily in any middleware, or in your error
handler. Here is the error handler used in the example:

```javascript
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    if (err instanceof koaPolice.AuthenticationError) {
      this.body = 'Rejected by ' + err.policy;
      this.status = 401;
      if (err.policy.hasStrategy('htpasswd')) {
        this.set('www-authenticate', 'Basic realm=' + err.policy.scope + '-realm');
      }
    }
  }
});
```
