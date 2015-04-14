// [index.js](index.html) > lib/model_meta.js

// ## Model API Mixin
// Use this to add a simplified API wrapper for Swarm.

var expect = require('chai').expect,
    uuid = require('uuid');

// ##### Local Dependencies

// * [lib/common.js](common.html)

var common = require('./common.js').init({});

var model_cache = {};

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/model_meta', function () {
    // All models in Shipster must have "id", "name", and "description" properties.
    self.defaults = function (defs) {
      /* if (!defs.id) { defs.id = String; } */
      if (!defs.name) { defs.name = String; }
      if (!defs.description) { defs.description = String; }
      if (!defs.destroyed) { defs.destroyed = Boolean; }
      // **TODO** --  add dates?
      return defs;
    };

    // Create a basic model interface.
    self.interface = function (obj) {
      // `obj` must have a Model class, based on the Swarm Model type.
      if (!obj.Model) {
        throw new Error('Missing swarm model class.');
      }

      // Model ID generator.
      obj.id = function (params) {
        if (params.id) { return params.id; }
        if (params._id) { return params._id; }
        var id = uuid.v4();
        return id.toString().split('-')[4];
      };

      // Create a new model instance.
      obj.create = function (params, on_ready, on_change) {
        var _id = obj.id(params);
        return obj.init(_id, params, on_ready, on_change);
      };

      obj.get = function (_id, on_ready, on_change) {
        return obj.init(_id, null, on_ready, on_change);
      };

      // Initialize a new or existing model instance.
      obj.init = function (id, data, on_ready, on_change) {
        if (data.id) { delete data.id; }
        if (data._id) { delete data._id; }

        var model = new obj.Model(id || data || undefined),
            timer;

        if (model_cache[model._id]) {// HACK
          timer = setTimeout(handle_ready, 500);
        }

        // NOTE: should this be ".init" or "init" they both seem to work.
        model.on('.init', handle_ready);

        function handle_ready() {
          clearTimeout(timer);

          if (handle_ready.called) {
            // TODO: simulate change?
            return;
          }

          handle_ready.called = true;

          model._is_ready = true;// HACK
          model_cache[model._id] = model;

          if (id && data) { model.set(data); }
          if (typeof on_ready === 'function') { on_ready(model); }
        }

        model.on(function (spec, value, source) {
          if (typeof on_change === 'function')
            { on_change.call(model, spec, value, source); }
        });

        return model;
      };

      // Destroy is not properly implemented yet...
      // WARNING: removing data is not recommended until Swarm is more reliable and better documented.
      obj.destroy = function (model) {
        // **TODO** -- figure out how to actually remove a model.
        // ```
        // model.reset();
        // model.save();
        // ```

        model.set({destroyed: true});
        delete model_cache[model._id];
        return model;
      };

      return obj;
    };

    // Exend a the basic model interface into a model collection interface.
    self.list_interface = function (obj) {
      // `obj` must have a List class. Should be based on a Swarm Vector, or another swarm type.
      if (!obj.List) {
        throw new Error('Missing swarm list class.');
      }

      // Ensure the basic model interface already exists.
      self.interface(obj);

      obj.index = function (on_ready, on_change) {
        return obj.list('index', null, on_ready, on_change);
      };

      var create = obj.create;
      obj.create = function (params, on_ready, on_change, _index) {
        var index = _index || obj.index();

        var model = create(params, function (model) {
          if (index._is_ready) { add_to_index_on_ready(model); }
          else {
            index.on('.init', function (model) { add_to_index_on_ready(model); });
          }
        }, on_change);

        function add_to_index_on_ready(model) {
          if (index && model) {
            obj.add(index, model);

            if (index._id !== 'index') {
              return obj.index(function (index) {
                obj.add(index, model);
                if (on_ready) { on_ready(model); }
              });
            }
          }
          if (on_ready) { on_ready(model); }
        }

        return model;
      };

      obj.list = function (id, items, on_ready, on_change) {
        id = (id === null) ? undefined : (id || obj.id());

        var list = new obj.List(id || undefined);

        list.on('.init', function () {
          var count = list.length();
          if (count) {
            list.forEach(function (model) {
              model.checkUplink();
              model.on(function () {
                count -= 1;
                if (count <= 0) { finish(); }
              });
            });
          }
          else { finish(); }
          function finish() {
            list._is_ready = true;
            if (items && items.forEach) { items.forEach(obj.add.bind(null, list)); }
            if (typeof on_ready === 'function') { on_ready(list); }
          }
        });

        list.on(function (spec, value, source) {
          // list.create = create_item;
          if (typeof on_change === 'function')
            { on_change(list, spec, value, source); }
        });

        return list;
      };

      obj.add = function (list, model) {
        var matches = list.filter(function (item) {
          return item._id === model._id || item.id === model.id;
        });
        if (!matches.length) { list.addObject(model); }
        return list;
      };

      obj.remove = function (list, model) {
        list.removeObject(model);
        return list;
      };

      var destroy = obj.destroy;
      obj.destroy = function (model, list) {
        // NOTE: if the model belongs to a list and this is called it may cause a infinite loop.
        if (list && model) { obj.remove(list, model); }
        return destroy(model);
      };

      return obj;
    };

    self.relationship = {};

    self.relationship.one_to_one = function (foreign_key, related_model_interface) {
      if (typeof related_model_interface.init !== 'function') {
        throw new Error('Related model must have an init method.');
      }

      return function one_related(model, on_ready, on_change) {
        var related_id = model[foreign_key] || model;
        if (typeof related_id !== 'string') {
          if (on_ready) { on_ready(null); }
          return null;
        }
        return related_model_interface.init(related_id, null, on_ready, on_change);
      };
    };

    self.relationship.one_to_many = function (related_model_interface) {
      if (typeof related_model_interface.list !== 'function') {
        throw new Error('Related model must have a list interface.');
      }

      return function list_related(model, on_ready, on_change) {
        var list_id = model._id || model;
        return related_model_interface.list(list_id, [], on_ready, on_change);
      };
    };

    // **TODO** -- `self.relationship.many_to_many`;
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
