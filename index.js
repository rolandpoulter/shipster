// Here is an overview of the directory structure for the Shipster codebase.
// Please read the [read me](README.html) file if you are new.

// * **bin/** -- Executables.
// * **config/** -- Shipster configuration files.
// * [config/default.js](default.html) -- Default configuration example.
// * **config/pem/** -- Default location of PEM files for SSL.
// * **daemon/** -- Home of daemon specific scripts.
// * **docs/** -- Compile directory for generated documentation.
// * [gulpfile.js](gulpfile.html) -- Useful developer gulp scripts.
// * index.js -- Mostly for show (meta).
// * **lib/** -- Library of shared scripts.
//   * [lib/cli.js](cli.html) -- Command Line Interface.
//   * [lib/common.js](common.html) -- Commonly used methods.
//   * [lib/config.js](config.html) -- Configuration loader.
//   * [lib/daemon.js](daemon.html) -- Daemon process manager.
//   * [lib/dashboard.js](dashboard.html) -- Dasbhoard server process.
//   * [lib/model_meta.js](model_meta.html) -- Model API helpers.
//   * [lib/model.js](model.html) -- Shipster data model.
//   * [lib/pem.js](pem.html) -- PEM file manager.
//   * [lib/redis.js](redis.html) -- Redis client/server helpers.
//   * [lib/swarm.js](swarm.html) -- Swarm client/server helpers.
// * **model/** -- General model definition scripts.
// * **node_modules/** -- NPM depenencies.
// * [README.md](README.html) -- Read this file to learn more about Shipster.
// * [seed_test.js](seed_test.html) -- Seed test data quickly.
// * [start.js](start.html) -- Start everything!
// * **storage/** -- Default file storage directory of swarm data.
// * [test.js](test.html) -- Run all the tests!

// ## A Functional Template
// This file serves as a simple example of the standard practices used in the
// Shipster codebase.

// External modules should be required at the top of the file.
var expect = require('chai').expect;

// Followed by local scripts.
var common = require('./lib/common.js').init({}); // Needed immediately.

// It might make sense to break different groups of dependencies down into
// different `var` statements. Named lists should be kept alphabetical.
var cli        = require('./lib/cli.js'),
    config     = require('./lib/config.js'),
    daemon     = require('./lib/daemon.js'),
    dashboard  = require('./lib/dashboard.js'),
    model_meta = require('./lib/model_meta.js'),
    model      = require('./lib/model.js'),
    redis      = require('./lib/redis.js'),
    swarm      = require('./lib/swarm.js');

// #### `init` Method

// All modules should export an `init` for creating API methods. This is where implementation code will go.
// The first argument should always be `self` -- an object the API methods will be added to.
exports.init = function (self) {
  // The `init` method should always `"use strict"`.
  'use strict';

  // A domain should be setup. The name should make it easy identify this script.
  self.domain = common.domain_setup('shipster/index', function () {
    // In this case the process title is set to the domain name.
    process.title = this.name;

    self.common    = common; // Already initialized.

    // This paticular script only serves as an integration point for other Shipster services.
    // Here several modules are initialized and exposed.
    // However, this is where API methods should be defined:
    // >```
    // self.my_method = function (obj) {
    //   obj.state = true;
    //   return obj;
    // };
    // ```
    self.cli        = cli        .init({});
    self.config     = config     .init({});
    self.daemon     = daemon     .init({});
    self.dashboard  = dashboard  .init({});
    self.model_meta = model_meta .init({});
    self.model      = model      .init({});
    self.redis      = redis      .init({});
    self.swarm      = swarm      .init({});

    // Snake case is prefered in the Shipster codebase, but since it is written,
    // in JavaScript this rule will need to be flexible.
  });

  // Expose the test method so self can be verified, if need be.
  self.test = exports.test.bind(self, self);

  // Always return self.
  return self;
};

// #### `test` Method

// All modules should export a `test` method. This serves as a nice use case example
// and makes it easy to test a single script. No library or runner is provided, however
// it is recommended that a good assertion library be used. This way you can plug this
// test into a test suite, or not...
exports.test = function (self) {
  // The object being tests can be either passed into the `test` method as `self`.
  // Or a temporary version will be initialized.
  self = self || exports.init({});

  // Each component has its own `test` method that can be called.
  var components = [
    'cli',
    'common',
    'config',
    'daemon',
    'dashboard',
    'model_meta',
    'model',
    'redis',
    'swarm'
  ];

  components.forEach(function (component) {
    self[component].test();
  });

  // Tests should be wrapped in a seperate domain, however you can recycle the name from the `init` domain.
  common.domain_setup(self.domain.name + ':test', function () {
    console.log('Running', this.name, 'tests...');
    // Test freedom...
    expect(self).to.be.ok();
    components.forEach(function (name) { expect(self[name]).to.be.ok(); });
    console.log('Passed', this.name, 'tests.');
  });

  // `test` methods should return `this` so that they work better with method chaining.
  return this;
};

// Allows test to run if this script is called with `node` directly.
if (!module.parent) { exports.test(); }

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
