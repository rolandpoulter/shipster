// [index.js](index.html) > config/default.js

module.exports = {
  // Command line interface configuration:
  "cli": {},
  // Daemon configuration:
  "daemon": {
    "daemon_id": null,
    "data_server": "localhost:5656",
    "rest_server": "localhost:5619",
    "sock_server": "localhost:5666",
    "proxy_server": "localhost:80"
  },
  // Dashboard configuration:
  "dashboard": {
    "rest_server": "localhost:5619",
    "sock_server": "localhost:5666",
    "http_server": "localhost:5600"
  },
  // PEM file configuration:
  "pem": {
    "server_key":  "server_key.pem",
    "server_cert": "server_cert.pem",
    "client_key":  "client_key.pem",
    "client_cert": "client_cert.pem"
  },
  // Proxy configuration:
  "proxy": {
    ".*": "${url}"// TODO:
  },
  // Redis configuration:
  "redis": {
    "local_server": "localhost:5656"
  },
  // Swarm configuration:
  "swarm": {
    "client_id": null, // Set to falsy to generate a random ID.
    "server_id": null, // Set to falsy to generate a random ID.
    "local_server": "localhost:5666",
    "remote_servers": []
  }
};

// ## ISC LICENSE

// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.

// **THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
// OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// OF THIS SOFTWARE.**
