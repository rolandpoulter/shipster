// [index.js](index.html) > lib/cli.js

var cli = require('cli'),
    repl = require('repl');

var config = require('./config.js').init({}),
    common = require('./common.js').init({}),
    pem = require('./pem.js').init({});

exports.init = function (self) {
  process.title = 'shipster-cli';

  cli.enable('status');

  cli.parse({
    repl: ['r', '--repl', 'Enable Shipster Command Line Interface'],
    exec: ['e', '--exec', 'Execute']
  });

  cli.main(function(args, options) {
    this.ok('SCLI: ' + options.repl);

    if (options.repl || !options.exec) {
      console.log('Now entering REPL interface.');

      repl.start({
        eval: exec,
        prompt: '> ',
        terminal: true,
        input: process.stdin,
        output: process.stdout,
        useColors: true
      });
    }
  });

  function exec(cmd, context, filename, callback) {
    context.filename = filename;

    context._ = self;
    context.h =
    context.help = 'Shipster Command Line Interface';

    context.w =
    context.wizard = {toString: function () {return this.h;}};
    context.wizard.h =
    context.wizard.help = 'wizard help';

    context.d =
    context.domains = {toString: function () {return this.h;}};

    context.pem = pem;

    try {
      /*jshint evil:true, ignore:start*/
      with (context) {
      /*jshint ignore:end*/
        callback(null, eval(cmd));
      /*jshint ignore:start*/
      }
      /*jshint evil:false, ignore:end*/
    } catch (err) {
      callback(err);
    }
  }

  self.test = function () {
    return self;
  };

  self.help = function () {
    console.log('HELP!');
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
