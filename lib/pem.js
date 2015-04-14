// [index.js](index.html) > lib/pem.js

var expect = require('chai').expect,
    fs,
    pem;

var common = require('./common.js').init({}),
    config = require('./config.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/pem', function () {
    self.init_pems = function init_pems(options, callback) {
      options = options || {};
      if (!options.reload && (self.server_key || self.client_key || self.load_pems())) {
        if (callback) { callback(); }
        return self;
      }
      if (self.new_pems) {
        self.new_pems(options, function () {
          self.write_pems();
          self.load_pems();
          if (callback) { callback(); }
        });
      }
      return self;
    };

    self.load_pems = function () {
      var stored_pems = self.read_pems();
      if (stored_pems) {
        self.server_key = stored_pems.server_key;
        self.server_cert = stored_pems.server_cert;
        self.client_key = stored_pems.client_key;
        self.client_cert = stored_pems.client_cert;
        return true;
      }
    };

    try {
      fs = require('' + 'fs');
      pem = require('' + 'pem');
    }

    // Client Side Hack
    catch (err) {
      self.read_pems = function () {
        return {
          /* server_key: require('../config/pem/server_cert.pem')[0], */
          server_cert: require('../config/pem/server_cert.pem')[0],
          client_key: require('../config/pem/client_key.pem')[0],
          client_cert: require('../config/pem/client_cert.pem')[0]
        };
      };

      return;
    }

    self.new_pems = function (options, callback) {
      options = options || {};
      options.days = 7;
      options.selfSigned = true;

      pem.createCertificate(options, function (err, keys) {
        self.raw_server_key = keys.serviceKey;
        self.raw_server_cert = keys.certificate;

        pem.createCertificate(options, function (err, keys) {
          self.raw_client_key = keys.serviceKey;
          self.raw_client_cert = keys.certificate;

          if (callback) { callback(); }
        });
      });
    };

    var root_path = __dirname + '/../config/pem/';

    if (!fs.existsSync(root_path)) { fs.mkdirSync(root_path); }

    self.read_pems = function () {
      return {
        server_key:  fs.readFileSync(root_path + config.get('pem.server_key'),  'utf8'),
        server_cert: fs.readFileSync(root_path + config.get('pem.server_cert'), 'utf8'),
        client_key:  fs.readFileSync(root_path + config.get('pem.client_key'),  'utf8'),
        client_cert: fs.readFileSync(root_path + config.get('pem.client_cert'), 'utf8')
      };
    };

    self.write_pems = function () {
      // console.log(self.raw_server_key);
      fs.writeFileSync(root_path + config.get('pem.server_key'),  self.raw_server_key);
      fs.writeFileSync(root_path + config.get('pem.server_cert'), self.raw_server_cert);
      fs.writeFileSync(root_path + config.get('pem.client_key'),  self.raw_client_key);
      fs.writeFileSync(root_path + config.get('pem.client_cert'), self.raw_client_cert);
      return self;
    };
  });

  self.test = function () {
    common.domain_setup(self.domain.name + ':test', function () {
      console.log('Running', this.name, 'tests...');
      expect(self).to.be.an('object');
      self.init_pems({reload: true});
      console.log('Passed', this.name, 'tests.');
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
