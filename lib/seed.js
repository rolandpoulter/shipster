// [index.js](index.html) > seed_test.js

var async = require('async'),
    expect = require('chai').expect;

var common = require('./lib/common.js').init({}),
    model = require('./lib/model.js').init({}),
    // pem = require('./lib/pem.js').init({}),
    swarm = require('./lib/swarm.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('lib/seed', function () {
    // var seed_domain = this;

    self.probe = function () {
      if (typeof window === 'undefined') { return self.probe_machine(); }
      self.probe_client();
    };

    self.probe_client = function (options) {
      self.create({
        // domain: { id: 'example', name: 'Example', description: 'Example' },
        // platform: { id: 'example', name: 'Example', desription: 'Example' },
        // machine: { id: 'example', name: 'Example', desription: 'Example' },
        // machine_status: 'active',
        // ship: { id: 'example', name: 'Example', desription: 'Example' },
        // operation: { id: 'example', name: 'Example', desription: 'Example' },
        exit: options.exit
      });
    };

    self.probe_machine = function (options) {
      self.create({
        // domain: { id: 'example', name: 'Example', description: 'Example' },
        // platform: { id: 'example', name: 'Example', desription: 'Example' },
        // machine: { id: 'example', name: 'Example', desription: 'Example' },
        // machine_status: 'active',
        // ship: { id: 'example', name: 'Example', desription: 'Example' },
        // operation: { id: 'example', name: 'Example', desription: 'Example' },
        exit: options.exit
      });
    };

    self.example_data = function (options) {
      self.create({
        domain: { id: 'example', name: 'Example', description: 'Example' },
        platform: { id: 'example', name: 'Example', desription: 'Example' },
        machine: { id: 'example', name: 'Example', desription: 'Example' },
        machine_status: 'active',
        ship: { id: 'example', name: 'Example', desription: 'Example' },
        operation: { id: 'example', name: 'Example', desription: 'Example' },
        exit: options.exit
      });
      // More complex test data.
      //```
      // self.manual({
      //   domains: [
      //     {
      //       id: 'd0', name: 'Domain 0', description: 'First example domain',
      //       key: 'key',
      //       private_key: 'private key',
      //       machines: [0]
      //     },
      //     {
      //       id: 'd1', name: 'Domain 1', description: 'Second example domain',
      //       key: 'key',
      //       private_key: 'private key',
      //       machines: [1, 'm2']
      //     }
      //   ],
      //   platforms: [
      //     { id: 'debian', name: 'Debian', description: 'Debian Linux' },
      //     { id: 'windows', name: 'Windows', description: 'Windows 7 or higher' },
      //     { id: 'macosx', name: 'Mac OS X', desription: 'Mac OS X' }
      //   ],
      //   machines: [
      //     {
      //       id: 'm0', name: 'Machine A', description: '',
      //       ip: model.ip,
      //       architecture: 'amd64',
      //       resources: {
      //         cpus: 1,
      //         disk: '5gb',
      //         memory: '1024mb'
      //       },
      //       metrics: [
      //         { time: Date.now(), cpus: 0.5, disk: '20mb', memory: '140mb' }
      //       ]
      //     },
      //     {
      //       id: 'm0', name: 'Machine A', description: '',
      //       ip: model.ip,
      //       architecture: 'amd64',
      //       resources: {
      //         cpus: 1,
      //         disk: '5gb',
      //         memory: '1024mb'
      //       },
      //       metrics: [
      //         { time: Date.now(), cpus: 0.5, disk: '20mb', memory: '140mb' }
      //       ]
      //     },
      //     {
      //       id: 'm0', name: 'Machine A', description: '',
      //       ip: model.ip,
      //       architecture: 'amd64',
      //       resources: {
      //         cpus: 1,
      //         disk: '5gb',
      //         memory: '1024mb'
      //       },
      //       metrics: [
      //         { time: Date.now(), cpus: 0.5, disk: '20mb', memory: '140mb' }
      //       ]
      //     }
      //   ],
      //   machine_status: {
      //     'active':   [[0, 0], ['d1', 'm1']],
      //     'inactive': [[1, 1]],
      //   },
      //   ships: [
      //     {
      //       id: 's0', name: 'Ship A', description: ''
      //     }
      //   ],
      //   operations: [
      //     {
      //       id: 'o0', name: 'Op 0', description: ''
      //     }
      //   ],
      //   exit: options.exit
      // });
      //```
    };

    self.create = function (params) {
      options = options || {};

      swarm.client(function () {
        async.auto({
          domain: function (cb, data) {
            if (!params.domain) { return cb(); }

            if (typeof params.domain === 'string') {
              model.domains.get(params.domain)
            }

            function on_ready(domain_model) {
              cb(null, domain_model);
            }
            // model.domains.init(function (model_index) {
            //   async.map(options.domains,
            //     function (model_params, next) {
            //       var matching_model = model_index.filter(function (model) {
            //         if (model._id === new_domain._id) return model;
            //       })[0];
            //
            //       if (matching_model) { return cb(null, matching_model); }
            //
            //       model.domains.create({
            //         id: model.domains.id(new_domain),
            //         name: new_domain.name,
            //         description: new_domain.description,
            //         destroyed: new_domain.destroyed,
            //         url: new_domain.url,
            //         key: new_domain.key,
            //       }, function (saved_domain) {
            //         model.domains.set_private_key(model.domains.get_private_key(new_domain));
            //         cb(null, local_domain);
            //       });
            //
            //     },
            //     function (err, domains) {
            //
            //     }
            //   );
            // });
          },

          platforms: [function (cb, data) {

          }],

          machines: ['domains', function (cb, data) {
            model.machine.index(function (machines_index) {
              var local_machine = null;

              machines_index.forEach(function (machine) {
                if (local_machine) return;
                if (machine._id === 'seed') local_machine = machine;
              });

              if (local_machine) { return cb(null, local_machine); }

              var machine_status = {};
              machine_status[data.seed_domain._id] = 'active';

              model.machines.create({
                id: 'seed',
                name: '(seed)',
                description: 'A seeded machine',
                ip: 'localhost:5619',
                status: machine_status,
                architecture: 'unknown',
                resources: {},
                metrics: {}
              }, function (local_machine) {
                model.machines.add(data.seed_domain.machines, local_machine);
                cb(null, local_machine);
              });
            });
          }],

          ships: [function (cb, data) {

          }],

          operations: [function (cb, data) {

          }]
        }, function (err, data) {
          if (err) { console.error(err.stack || err); }
          console.log(data);
          exit();
        });

        model.domains.index(function (domain_index) {
          // console.log('GOT HERE', domain_index);

          if (domain_index.length() !== 0) {
            console.log('Already seeded.');
            return exit();
          }

          // console.log(domain_index.create.toString());

          var local = model.domains.create({
            id: 'local',
            name: '(local)',
            description: 'Default domain',
            url: 'http://shipify.io',
            key: 'FOO BAR SHIO'
          });

        });

          // var m1_status = {};
          // m1_status[local._id] = 'offline';
          //
          // var m1 = ({
          //   name: 'Local',
          //   description: 'The same machine shipster is running on.',
          //   ip: '0.0.0.0',
          //   status: m1_status, // TODO: this relationship needs to be impemented with swarm
          //   architecture: 'amd64',
          //   resources: {
          //     cpus: 1,
          //     disk: '5gb',
          //     memory: '1024mb'
          //   },
          //   metrics: [{
          //     time: Date.now(),
          //     cpus: 0.5,
          //     disk: '20mb',
          //     memory: '140mb'
          //   }]
          // });
          //
          // var p1 = m1.create_platform({
          //   os: 'linux',
          //   name: 'DebianVM',
          //   description: 'Debian Virtual Machine'
          // });
          //
          // var m2_status = {};
          // m2_status[d2._id] = 'offline';
          //
          // var m2 = d2.create_machine({
          //   name: 'Remote',
          //   description: 'Some VM somwhere.',
          //   ip: '255.255.255.255',
          //   status: m2_status, // TODO: this relationship needs to be impemented with swarm
          //   architecture: 'amd64',
          //   resources: {
          //     cpus: 1,
          //     disk: '5gb',
          //     memory: '1024mb'
          //   },
          //   metrics: [{
          //     time: Date.now(),
          //     cpus: 0.5,
          //     disk: '20mb',
          //     memory: '140mb'
          //   }]
          // }, function () {
          //   m2.platform = p1;
          //   m2.set({platformID: p1._id});
          // });
          //
          // var s1 = model.ships.create({
          //   name: 'one',
          //   description: 'something something somthing',
          //   manifest: {}
          // }, function add_p1() {
          //   if (!s1.platforms) { return setTimeout(add_p1, 50); }
          //   model.platforms.add(s1.platforms, p1);
          // });
          //
          // var s2 = model.ships.create({
          //   name: 'two',
          //   description: 'dark side',
          //   manifest: {
          //     src: [{git: 'git://'}],
          //     cmd: []
          //   }
          // }, function add_p1() {
          //   if (!s2.platforms) { return setTimeout(add_p1, 50); }
          //   model.platforms.add(s2.platforms, p1);
          // });
          //
          // model.operations.create({ // o1
          //   domainID: d1._id,
          //   machineID: m1._id,
          //   shipID: s1._id,
          //   name: 'Task One',
          //   description: 'installation',
          //   status: 'running',
          //   metrics: [{
          //     time: Date.now(),
          //     cpus: 0.5,
          //     disk: '20mb',
          //     memory: '140mb'
          //   }],
          //   commands: ['task2'],
          //   arguments: [[]],
          //   environment: {}
          // });
          //
          // model.operations.create({ // o2
          //   domainID: d2._id,
          //   machineID: m2._id,
          //   shipID: s2._id,
          //   name: 'Task Two',
          //   description: 'enhance... enhance... enhance',
          //   status: 'running',
          //   metrics: [{
          //     time: Date.now(),
          //     cpus: 0.5,
          //     disk: '20mb',
          //     memory: '140mb'
          //   }],
          //   commands: ['task2'],
          //   arguments: [[]],
          //   environment: {}
          // }, function (operation) {
          //   // setTimeout(console.log.bind(console, operation), 4000);
          //   console.log('Seeding done.');
          //   setTimeout(exit, 5000);
          // });
        // });
      });
      function exit() {
        if (typeof process !== 'undefined' && process.exit) {
          process.exit();
        }
      }
    };
  });

  self.test = function () {
    common.domain_setup(self.domain.name + ':test', function () {
      console.log('Running', this.name, 'tests...');
      expect(self).to.be.an('object');
      self.automatic({
        exit: process.exit
      });
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
