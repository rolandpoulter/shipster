// [index.js](index.html) > [lib/model.js](model.html) > model/operations.js

// ## Domain Model
// A domain has mant machines. It is responsible for authentication between hosts.

var expect = require('chai').expect,
    swarm = require('swarm');


// ##### Local Dependencies

// * [lib/common.js](common.html)
// * [lib/model_meta.js](model_meta.html)
// * [model/machines.js](machines.html)

var common = require('../lib/common.js').init({}),
    model_meta = require('../lib/model_meta.js').init({});

var machines = require('./machines.js').init({});

// #### Classes

// **DomainModel** -- A Swarm [`Model`](https://github.com/gritzko/swarm/blob/master/lib/Model.js)
// sub-class used to store a machine record. These machines may or may not be accessible.
var DomainModel = swarm.Model.extend('DomainModel', {
  defaults: model_meta.defaults({
    // Domain URL should be simple. Example: "sub.mysweetname.top"
    url: String,
    // Only Public Key is stored.
    key: String
  })
});

// **DomainList** -- A Swarm [`Vector`](https://github.com/gritzko/swarm/blob/master/lib/Vector.js)
// sub-class used to store a index of documents by _id.
var DomainList = swarm.Vector.extend('DomainList', {
  objectType: DomainModel
});

// ### Implementation

// >```
// require('./model/domains.js').init({}).test();
// ```
exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('model/domains', function () {
    // Assign each sub-class to self object.
    // It is important that they are named `Model` and `List` respectivley.
    self.Model = DomainModel;
    self.List  = DomainList;

    // This is because self is list, or index of models.
    // See *[model_meta.js](model_meta.html)*

    // Create list interface with Model and List classes.
    model_meta.list_interface(self);

    // Create helper method for initializing a one domain to many machines relationship.
    self.related_machines = model_meta.relationship.one_to_many(machines);

    // Private keys will be kept in memory for now. A secure storage strategy will be needed.
    var private_keys = {}; // TODO: find a way to safely persist keys.

    self.set_private_key = function (model, private_key) {
      if (private_key === undefined) { return undefined; }
      if (self.is_client) { return null; } // TODO: does the client need to set a private key?
      private_keys[model._id] = private_key;
    };

    self.get_private_key = function (model) {
      if (self.is_client) { return null; } // TODO: should the client be able to get a private key?
      return private_keys[model._id];
    };

    self.to_client = function (model) {
      return {
        // "_id" is hidden from the client, but an "id" will be provided.
        id: model._id,
        name: model.name,
        description: model.description,
        destroyed: model.destroyed,
        url: model.url,
        key: model.key,

        // The client should have a list of machines models and not just their "id".
        _machines: function (on_ready, on_change) {
          var client_data = this || {};
          self.related_machines(model, function (related_machines) {
            if (!model.machines) { model.machines = related_machines; }
            client_data.machines = related_machines.map(function (machine) {
              return machines.to_client(machine);
            });
            if (on_ready) { on_ready(client_data.machines, related_machines); }
          }, on_change);
          return client_data;
        },

        // Private keys should be secured.
        private_key: function (value) {
          if (value !== undefined) { return self.set_private_key(model, value); }
          return self.get_private_key(model);
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
    expect(self.Model).to.equal(DomainModel);
    expect(self.List).to.equal(DomainList);
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
