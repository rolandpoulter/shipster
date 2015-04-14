// [index.js](index.html) > [lib/daemon.js](daemon.html) > daemon/ssh.js

var expect = require('chai').expect,
    ssh = require('ssh2'),
    ssh_keygen = require('ssh-keygen');

var common = require('../lib/common.js').init({});

exports.init = function (self) {
  'use strict';

  self.domain = common.domain_setup('daemon/ssh', function () {
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
