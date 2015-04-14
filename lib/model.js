// [index.js](index.html) > lib/model.js

// ## Shipster Data Model
// Shipster uses Swarm which is a Model replica framework. It allows data to be distributed.

var expect = require('chai').expect;

// ##### Local Dependencies

// * [lib/common.js](common.html)

var common = require('./common.js').init({});

// ##### Model Dependencies

// * [model/domains.js](domains.html) --
// * [model/machines.js](ships.html) --
// * [model/operations.js](operations.html) --
// * [model/platforms.js](platforms.html) --
// * [model/ships.js](ships.html) --

var domains    = require('../model/domains.js'),
    machines   = require('../model/machines.js'),
    operations = require('../model/operations.js'),
    platforms  = require('../model/platforms.js'),
    ships      = require('../model/ships.js');

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/model', function () {
    self.domains    = domains    .init({});
    self.machines   = machines   .init({});
    self.operations = operations .init({});
    self.platforms  = platforms  .init({});
    self.ships      = ships      .init({});
  });

  // Bind test method to self.
  self.test = exports.test.bind(self, self);

  return self;
};

exports.test = function (self) {
  self = self || exports.init({});

  common.domain_setup(self.domain.name + ':test', function () {
    console.log('Running', this.name, 'tests...');

    expect(self).to.be.an('object');

    expect(self.domains).to.be.an('object');
    expect(self.machines).to.be.an('object');
    expect(self.operations).to.be.an('object');
    expect(self.platforms).to.be.an('object');
    expect(self.ships).to.be.an('object');

    console.log('Passed', this.name, 'tests.');
  });

  return this;
};

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
