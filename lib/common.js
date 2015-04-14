// [index.js](index.html) > lib/common.js

// ## Common Utilities

var _ = require('lodash'),
    debug = require('debug'),
    domain,
    EventEmitter = require('events').EventEmitter,
    expect = require('chai').expect,
    sinon = require('sinon');

var package_json = require('../package.json');

// General domain error handler. This will print the domain name and a stack trace.
function domain_error_handler(error) {
  if (error.domain) { console.error('Error Domain Name:', error.domain.name); }
  console.error(error.stack);
}

// Simplified domain setup helper method. This shims the basic functionality for
// domains if they are unavailable.
function domain_setup(name, fn, error_handler) {
  var last_error;
  function on_error(error) {
    if (last_error === error) { return; }
    last_error = error;

    if (!dom) { dom = {name: name}; }
    if (!error) { error = new Error('unknown.'); }
    if (!error.domain) { error.domain = dom; }
    else { error.domain._dom = dom; }
    domain_error_handler.call(this, error);
    if (error_handler) { error_handler.call(this, error); }
  }

  var dom,
      tag = package_json.name + '@' + package_json.version + '/';
  name = name.indexOf(tag) === 0 ? name : tag + name;
  error_handler = error_handler || domain_error_handler;

  try { domain = domain || require('domain'); }

  catch (missing_domain) {
    try { fn.call(dom, dom); }
    catch (err) { on_error.call(dom, err); }
    return dom;
  }

  dom = domain.create();
  dom.name = name;
  dom.on('error', on_error.bind(dom));

  try { dom.run(fn.bind(dom, dom)); }
  catch (err) { on_error.call(dom, err); }
  return dom;
}

var states = {},
    events = new EventEmitter();

exports.init = function (self, local) {
  'use strict';

  domain_setup('lib/common', function () {
    states = local ? {} : states;

    self._ = _;

    self.debug = debug;

    self.domain = this;

    self.domain_error_handler = domain_error_handler;

    self.domain_setup = domain_setup;

    self.events = local ? new EventEmitter() : events;

    self.state = function (name) {
      var fn;
      name = 'on:' + name;
      if (!states[name]) { return; }
      while ((fn = states[name].shift()) || states[name].length) { fn(); }
      states[name] = true;
      return self;
    };

    self.state_on = function (name, fn) {
      name = 'on:' + name;
      if (!states[name]) { states[name] = []; }
      if (states.name === true) { fn(); }
      else { states[name].push(fn); }
      return self;
    };

    self.package_json = package_json;

    return self;
  });

  self.test = function () {
    domain_setup(self.domain.name + ':test', function () {
      console.log('Running', this.name, 'tests...');
      expect(states).to.deep.equal({});
      expect(self).to.be.an('object');
      expect(self.state).to.be.a('function');
      expect(self.state_on).to.be.a('function');
      expect(self.state()).to.be.an('undefined');
      expect(self.state('undeclared')).to.be.an('undefined');
      expect(states).to.deep.equal({});
      var state_spy = sinon.spy();
      expect(self.state_on('declared', state_spy)).to.deep.equal(self);
      expect(states['on:declared']).to.be.an('array');
      expect(self.state('declared')).to.equal(self);
      expect(states['on:declared']).to.equal(true);
      expect(state_spy.calledOnce).to.equal(true);
      // console.log(self);
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
