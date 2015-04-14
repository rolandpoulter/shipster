// [index.js](index.html) > lib/swarm.js

var expect = require('chai').expect,
    https,
    swarm = require('swarm'),
    swarm_restapi,
    uuid = require('uuid'),
    wss;

var config = require('./config.js').init({}),
    common = require('./common.js').init({}),
    model,
    pem = require('./pem.js').init({});

// swarm.env.trace = true;

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/swarm', function () {
    self.start = function (callback) {
      console.log('Starting swarm with multiple hosts...');
      // swarm.env.multihost = true;
      // swarm.env.trace = true;
      self.server({}, function (server_refs) {
        // self.author_affix = '1';
        var swarm_client = self.client();
        // swarm.env.localhost = swarm_client;
        if (callback) { callback(swarm_client, server_refs); }
      });
      return self;
    };

    // self.author_affix = '1';

    self.client = function (on_ready) {
      pem.init_pems();

      var client_id = 'client~session';// + uuid.v4().toString().split('-')[0];
      // var client_id = null;
                      //'b';
                      //undefined;
                      // 'unique_client_id';
                      //'shipster~client';// + (
                      //config.get('swarm.client_id') ||
                      /*uuid.v4().toString().replace(/\-/g, '_');*/
                      // uuid.v4().toString().split('-')[0]
                      // );

      // if (typeof window !== 'undefined') {
      //   client_id = window.localStorage.getItem('client_id') ||
      //               'A' + swarm.Spec.int2base(
      //                 (Math.random() * 10000) | 0
      //               );
      //   window.localStorage.setItem('client_id', client_id);
      // }
      //
      // else {
        // client_id = 'A' + swarm.Spec.int2base(
          // (Math.random() * 10000) | 0
        // );
        // console.log(client_id);
        // client_id = 'A000Hb';
      // }

      // TODO: should only allow unauthorized certs in development
      // if (true) { process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; }

      // 1. create local Host
      var local_swarm_host = new swarm.Host(client_id);

      var url = 'wss://' + config.get('swarm.local_server');
      // console.log('connecting to:', url);

      var options = {
        ca: [pem.server_cert],
        // cert: pem.client_cert,
        // key: pem.client_key,
        // rejectUnauthorized: true
      };
      // console.log('with options:', options);

      // 2. connect to your server
      // TODO: passing opts.ca requires custom modifications to Swarm
      local_swarm_host.connect(url, options);

      // swarm.env.localhost = swarm.env.localhost || local_swarm_host;

      if (on_ready) { on_ready(local_swarm_host); }

      return local_swarm_host;
    };

    self.server = function (options, on_ready) {
      try {
        swarm_restapi = require('' + 'swarm-restapi');
        https = https || require('' + 'https');
        wss = wss || require('' + 'ws');
      }

      catch (err) {
        console.warn('No swarm server running.', err);
        // TODO: should add local storage host?
        if (on_ready) { on_ready(); }
        return;
      }

      options = options || {};

      var port = parseInt(config.get('swarm.local_server').split(':')[1], 10);

      // TODO: this should be called outside of self.server.
      pem.init_pems(options.pems, function () {
        // use file storage
        var file_storage = new swarm.FileStorage('storage');
        // var level_storage = new swarm.LevelStorage('storage', {
        //   path: __dirname + '/../storage/db',
        //   db: require('leveldown')
        // });
        // TODO: try redis for storage
        // var redis_storage = new swarm.RedisStorage('swarm', {
        //   redis: require('redis'),
        //   redisConnectParams: {
        //       port: 6379,
        //       host: '127.0.0.1',
        //       options: {}
        //   }
        // });

        var server_id = 'swarm~server'; //+ uuid.v4().toString().split('-')[0];
        // var server_id = null;
                        //'index~a';
                        // 'swarm~nodejs';
                        //'shipster~server';// + (
                        //config.get('swarm.server_id') ||
                        /*uuid.v4().toString().replace(/\-/g, '_');*/
                        //uuid.v4().toString().split('-')[0]
                        //);

        console.log(server_id);

        // create the server-side Swarm Host
        // NOTE: this host id is finicky sometimes it causes things to break, not sure why it matters so much.
        var server_swarm_host = new swarm.Host(server_id, 0,
          file_storage);
          // level_storage);
          // redis_storage);

        // self.server_swarm_host.on('error', function () {
        //   console.log('ERROR', arguments);
        // });

        var api_handler = swarm_restapi.createHandler({
          route: '/',
          host: server_swarm_host
          // authenticate: function (req, cb) {
          //   cb(null, 'username');
          // }
        });

        // create and start the HTTPS server
        var https_server = https.createServer({
          // ca: [pem.client_cert],
          cert: pem.server_cert,
          key: pem.server_key,
          // rejectUnauthorized: true,
          // requestCert: true
        }, api_handler);

        https_server.listen(port, function (err) {
          if (err) {
            console.warn('Can\'t start server. Error: ', err, err.stack);
          }
          else {
            console.log('Secure swarm server started at ' + port);
          }
          if (on_ready) {
            on_ready({
              swarm_storage: file_storage,
              swarm_host: server_swarm_host,
              https: https_server,
              wss: wss_server
            });
          }
        });

        // start WebSocket server
        var wss_server = new wss.Server({
          server: https_server
        });

        // accept incoming WebSockets connections
        wss_server.on('connection', function (wss_client) {
          console.log('new incoming WebSocket connection');

          // wss_client.on('open', function () {
          //   console.log('WS OPEN');
          // });
          // wss_client.on('close', function () {
          //   console.log('WS CLOSE');
          // });
          // wss_client.on('message', function (msg) {
          //   console.log('WS MSG', msg);
          // });
          // wss_client.on('error', function (msg) {
          //   console.log('WS ERROR', msg);
          // });

          var swarm_client = new swarm.EinarosWSStream(wss_client);

          server_swarm_host.accept(swarm_client, {
            delay: 50
          });
        });
      });
    };
  });

  self.test = function () {
    common.domain_setup(self.domain.name + ':test', function () {
      model = require('./model.js').init({});

      console.log('Running', this.name, 'tests...');
      expect(self).to.be.an('object');

      self.start(function () {
        // console.log('STARTED');
        // model.domains.init('d1', null, function () {
          // console.log('GOT HERE');
        // });

        model.domains.list('index', [], function (index) {
          // console.log(index);
          function update_domain(domain) {
            var update = {};
            if (!domain.id) { update.id = domain._id; }
            if (!domain.name) { update.name = domain.id || update.id; }
            // if (!domain.description) { update.description = ''; }
            // if (!domain.url) { update.url = ''; }
            // if (!domain.publicKey) { update.publicKey = ''; }
            // if (!domain.privateKey) { update.privateKey = ''; }
            // update._id = domain._id;
            domain.set(update);
            console.log(domain._id, domain.id, domain.name);
            model.domains.add(index, domain);
          }

          if (index.length() === 0) {
            console.log('INIT DOMAINS:');
            model.domains.init('d1', {}, update_domain);
            model.domains.init('d2', {}, update_domain);
            model.domains.init('d3', {}, update_domain);
          }

          else {
            console.log('LOAD DOMAINS:');
            index.forEach(function (domain) {
              console.log(domain._id, domain.id, domain.name);
              // if (domain._id === 'd3') { model.domains.destroy(domain, index); }
            });
          }
        }, function (index) {
          console.log('DOMAIN INDEX CHANGE:');

          index.forEach(function (domain) {
            console.log(domain._id, domain.id, domain.name);
          });
        });
      });
    });
    return self;
  };

  return self;
};

if (!module.parent && typeof window === 'undefined') { exports.init({}).test(); }

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
