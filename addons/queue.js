// var kue = require('kue');

exports.init = function (self) {
  'use strict';
  self.test = function (self) {
    return self;
  };
  return self;
};

if (!module.parent) { exports.init({}).test(); }
