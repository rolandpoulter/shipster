// [index.js](index.html) > lib/daemon.js

var common = require('./common.js').init({});

// lib dependencies
var config = require('./config.js'),
    model  = require('./model.js'),
    swarm  = require('./swarm.js');

// daemon dependencies
// * [daemon/process_monitor.js](process_monitor.html) -- meta.
// * [daemon/rpc.js](rpc.html) -- meta.
// * [daemon/shell.js](shell.html) -- meta.
// * [daemon/ssh.js](ssh.html) -- meta.
// * [daemon/web_api.js](web_api.html) -- meta.
// * [daemon/web_proxy.js](web_proxy.html) -- meta.
// var process_monitor = require('../daemon/process_monitor.js');
//
// var rpc   = require('../daemon/rpc.js'),
//     shell = require('../daemon/shell.js'),
//     ssh   = require('../daemon/ssh.js');

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/daemon', function () {
    process.title = this.name;

    // Setup core dependencies
    self.config = config .init({});
    self.model  = model  .init({});
    self.swarm  = swarm  .init({});

    self.swarm.server();

    // Setup interface dependencies
    // self.rpc   = rpc   .init({});
    // self.ssh   = ssh   .init({});
    // self.shell = shell .init({});

    // Setup main dependency
    // self.process_monitor = process_monitor.init({});
  });

  self.test = function () {
    // var components = ['config', 'swarm', 'model',
      // 'rpc', 'ssh_connection', 'shell', 'process_monitor'
    // ];
    // components.forEach(function (component) { self[component].test(); });
    // common.domain_setup(self.domain.name + ':test', function () {
    //   console.log('Running', this.name, 'tests...');
    //   console.log('Passed', this.name, 'tests.');
    // });
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
