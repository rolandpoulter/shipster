// [index.js](index.html) > [lib/model.js](model.html) > model/operations.js

// ## Operation Model
// An operation has one domain, one machine, and one ship.
// It represents a process in a machines' operating system..

var expect = require('chai').expect,
    swarm = require('swarm');

// ##### Local Dependencies

// * [lib/common.js](common.html)
// * [lib/model_meta.js](model_meta.html)
// * [lib/platforms.js](platforms.html)

var common = require('../lib/common.js').init({}),
    model_meta = require('../lib/model_meta.js').init({});

var platforms = require('./platforms.js').init({});

// A ship has many platforms.
var ShipModel = swarm.Model.extend('ShipModel', {
  defaults: model_meta.defaults({
    manifest: Object
  })
});

var ShipList = swarm.Vector.extend('ShipList', {
  objectType: ShipModel
});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('model/ships', function () {
    self.Model = ShipModel;
    self.List  = ShipList;

    model_meta.list_interface(self);

    self.related_platforms = model_meta.relationship.one_to_many(platforms);

    self.to_client = function (model) {
      return {
        id: model._id,
        name: model.name,
        description: model.description,
        destroyed: model.destroyed,
        manifest: model.manifest,

        // The client should have a list of machines models and not just their "id".
        _platforms: function (on_ready, on_change) {
          var client_data = this || {};
          self.related_platforms(model, function (related_platforms) {
            if (!model.platforms) { model.machines = related_platforms; }
            client_data.platforms = related_platforms.map(function (platform) {
              return platforms.to_client(platform);
            });
            if (on_ready) { on_ready(client_data.platforms, related_platforms); }
          }, on_change);
          return client_data;
        }
      };
    };
  });

  // Bind test method to self.
  self.test = exports.test.bind(self, self);

  return self;
};

// ### Test
// > node ./model/ships.js
exports.test = function (self) {
  'use strict';

  self = self || exports.init({});

  common.domain_setup(self.domain.name + ':test', function () {
    var test_domain = this;
    console.log('Running', test_domain.name, 'tests...');
    expect(self).to.be.an('object');
    expect(self.Model).to.equal(ShipModel);
    expect(self.List).to.equal(ShipList);
    // TODO: `model_meta.interface.test()` and `model_meta.list_interface.test()`
    (['id', 'create', 'destroy', 'index', 'init', 'list', 'add', 'remove'
      ]).forEach(function (method) { expect(self[method]).to.be.a('function'); });
    console.log('Passed', test_domain.name, 'tests.');
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
