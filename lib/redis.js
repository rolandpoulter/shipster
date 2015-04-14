// [index.js](index.html) > lib/redis.js

var expect = require('chai').expect,
    redis = require('redis'),
    RedisServer = require('redis-server');

var config = require('./config.js').init({}),
    common = require('./common.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/redis', function () {
    self.start = function (on_ready) {
      try {
        console.log('Starting redis client and server.');
        self.server({}, function (server) {
          self.client(function (client) {
            if (on_ready) { on_ready(client, server); }
          });
        });
      } catch (err) {
        console.error(err.domain, err.stack || err);
      }
      return self;
    };

    self.client = function (on_ready, redis_options) {
      var url = config.get('redis.local_server').split(':'),
          host = url[0],
          port = parseInt(url[1], 10);

      var client = redis.createClient(port, host, redis_options);

      client.on('ready', function () {
        console.log('redis_ready', arguments);
        if (on_ready) { on_ready(client); }
      });

      client.on('error', function (err) {
        err.domain = err.domain || self.domain;
        console.error(err.domain, err.stack || err);
      });

      return client;
    };

    self.server = function (options, on_ready) {
      // TODO: this should eventually use the process manager from shipster so it can be managed.
      options = options || {};

      options.port = options.port ||
        parseInt(config.get('redis.local_server').split(':')[1], 10);

      var server = new RedisServer(options);

      server.open(function (err) {
        if (err) { console.error(self.domain, err.stack || err); }
        if (on_ready) { on_ready(server); }
      });

      return server;
    };
  });

  self.test = function () {
    common.domain_setup(self.domain.name + ':test', function () {
      console.log('Running', this.name, 'tests...');
      expect(self).to.be.an('object');

      self.start(function (client, server) {
        console.log('GOT HERE', client, server);
        client.set('string key', 'string val', redis.print);
        client.hset('hash key', 'hashtest 1', 'some value', redis.print);
        client.hset(['hash key', 'hashtest 2', 'some other value'], redis.print);
        client.hkeys('hash key', function (err, replies) {
          console.log(replies.length + ' replies:');
          replies.forEach(function (reply, i) {
            console.log('    ' + i + ': ' + reply);
          });
          client.quit();
          server.close();
        });
      });
    });
    return self;
  };

  return self;
};

if (!module.parent) { exports.init({}).test(); }

// ## ISC LICENSE

// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that no above copyright notice
// and this permission notice appear in all copies.

// **THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
// OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// OF THIS SOFTWARE.**
