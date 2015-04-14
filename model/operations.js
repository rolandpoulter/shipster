// [index.js](index.html) > [lib/model.js](model.html) > model/operations.js

// ## Operation Model
// An operation has one domain, one machine, and one ship.
// It represents a process in a machines' operating system.

var expect = require('chai').expect,
    swarm = require('swarm');

// ##### Local Dependencies

// * [lib/common.js](common.html)
// * [lib/model_meta.js](model_meta.html)

var common = require('../lib/common.js').init({}),
    model_meta = require('../lib/model_meta.js').init({});

var domains = require('./domains.js').init({}),
    machines = require('./machines.js').init({}),
    ships = require('./ships').init({});

// #### Classes

// **OperationModel** -- A Swarm [`Model`](https://github.com/gritzko/swarm/blob/master/lib/Model.js)
// sub-class used to store a document representing the last known state of a process.
var OperationModel = swarm.Model.extend('OperationModel', {
  defaults: model_meta.defaults({
    arguments: Array,
    commands: Array,
    domainID: String,
    environment: Object,
    machineID: String,
    metrics: Array, // list of metric data
    shipID: String,
    status: String
  })
});

// **OperationList** -- A Swarm [`Vector`](https://github.com/gritzko/swarm/blob/master/lib/Vector.js)
// sub-class used to store a index of documents by _id.
var OperationList = swarm.Vector.extend('OperationList', {
  objectType: OperationModel
});

// ### Implementation

// >```
// require('./model/operations.js').init({}).test();
// ```
exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('model/operations', function () {
    // Assign each sub-class to self object.
    // It is important that they are named `Model` and `List` respectivley.
    self.Model = OperationModel;
    self.List  = OperationList;

    // This is because self is list, or index of models.
    // See *[model_meta.js](model_meta.html)*
    model_meta.list_interface(self);

    self.related_domain  = model_meta.relationship.one_to_one('domainID',  domains);
    self.related_machine = model_meta.relationship.one_to_one('machineID', machines);
    self.related_ship    = model_meta.relationship.one_to_one('shipID',    ships);

    self.to_client = function (model) {
      return {
        id: model._id,
        name: model.name,
        description: model.description,
        destroyed: model.destroyed,
        arguments: model.arguments,
        commands: model.commands,
        environment: model.environment,
        metrics: model.metrics, // list of metric data
        status: model.status,

        domainID: model.domainID,
        machineID: model.machineID,
        shipID: model.shipID,

        _domain: function (on_ready, on_change) {
          var client_data = this || {};
          self.related_domain(model, function (related_domain) {
            if (!model.domain) { model.domain = related_domain; }
            client_data.domain = domains.to_client(related_domain);
            if (on_ready) { on_ready(client_data.domain, related_domain); }
          }, on_change);
          return client_data;
        },

        _machine: function (on_ready, on_change) {
          var client_data = this || {};
          self.related_machine(model, function (related_machine) {
            if (!model.machine) { model.machine = related_machine; }
            client_data.machine = machines.to_client(related_machine);
            if (on_ready) { on_ready(client_data.machine, related_machine); }
          }, on_change);
          return client_data;
        },

        _ship: function (on_ready, on_change) {
          var client_data = this || {};
          self.related_ship(model, function (related_ship) {
            if (!model.ship) { model.ship = related_ship; }
            client_data.ship = ships.to_client(related_ship);
            if (on_ready) { on_ready(client_data.ship, related_ship); }
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

// >     $> node ./model/operations.js
exports.test = function (self) {
  'use strict';

  self = self || exports.init({});

  common.domain_setup(self.domain.name + ':test', function () {
    var test_domain = this;
    console.log('Running', test_domain.name, 'tests...');
    expect(self).to.be.an('object');
    expect(self.Model).to.equal(OperationModel);
    expect(self.List).to.equal(OperationList);
    // **TODO** -- `model_meta.interface.test()` and `model_meta.list_interface.test()`
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
