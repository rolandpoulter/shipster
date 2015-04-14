// [index.js](index.html) > [lib/daemon.js](daemon.html) > daemon/process_monitor.js

var expect = require('chai').expect,
    pm2 = require('pm2');

var common = require('../lib/common.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('daemon/process_monitor', function () {
    self.pm2 = pm2;

    // Connect or launch PM2
    pm2.connect(function(err) {

      // Start a script on the current folder
      // pm2.start('test.js', { name: 'test' }, function(err, proc) {
        if (err) {
          throw new Error('err');
        }

        // Get all processes running
        pm2.list(function(err, process_list) {
          console.log(process_list);

          // Disconnect to PM2
          pm2.disconnect(function() {
            // process.exit(0);
          });
        });
      // });
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
