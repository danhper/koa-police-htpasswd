'use strict';

var path              = require('path');
var koa               = require('koa');
var koaPolice         = require('koa-police');
var koaPoliceHtpasswd = require('koa-police-htpasswd');

var app = koa();

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

var htpasswdStrategy = koaPoliceHtpasswd({
  user: path.join(__dirname, 'users.htpasswd')
}, {loadFile: true});
app.use(koaPolice({
  defaultStrategies: [htpasswdStrategy],
  policies: [{path: /\/protected.*/}, {path: '/home', enforce: false}]
}));

app.use(function *() {
  this.body = 'you accessed ' + this.path + ' as ' + this.state.user || 'anonymous';
});

app.listen(5000);
