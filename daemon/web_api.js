// [index.js](index.html) > [lib/daemon.js](daemon.html) > daemon/web_api.js

var expect = require('chai').expect,
    hapi = require('hapi');

var common = require('../lib/common.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('daemon/web_proxy', function () {
    var server = new hapi.Server();

    self.server = server;

    server.connection({
      port: 5619
    });

    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply('Hello, world!');
      }
    });

    server.route({
      method: 'GET',
      path: '/{name}',
      handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
      }
    });

    server.start(function () {
      console.log('Server running at:', server.info.uri);
    });
  });

  self.test = function () {
    common.domain_setup(self.domain.name + ':test', function () {
      console.log('Running', this.name, 'tests...');
      expect(self).to.be.an('object');
      console.log('Passed', this.name, 'tests.');
    });
    return self;
  };

  return self;
};

if (!module.parent) { exports.init({}).test(); }
