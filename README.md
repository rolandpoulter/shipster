[index.js](index.html) > README.md

# SHIPSTER

Shipster is a distributed process manager written for [Node.js](http://nodejs.org/). It can be used on a public, or a private network.

Shipster is not intended for production use, it is primarily for educational purposes. It is designed to be a toy. Future versions may be ready for prime time.

View [index.js](index.html) to learn more about the Shipster codebase. Easy to use, easy to clean.

## What is it, exactly?

More specifically, you can use Shipster to manage distributed processes on various computers or virtual machines. Each installation is considered a peer.

Peers can share data with each other and run remote procedures. They can also SSH into each other and run shell commands.

Processes are managed, and metrics are reported to peers. This allows you see resource usage.

For example you could buy a few Raspberry Pi computers. Install Shipster on them. Then host web services on a "personal cloud". Shipster makes it easy to manage your web services.

A very simple HTTP proxy is included as well.

In the future there will be add-ons that allow you to integrate better with other technologies like Docker and Git. KVM might be interesting. For now it runs shell scripts.

## How does it work?

The first thing you'll need to create after installing Shipster is a "Domain". It will generate a public and private key for each domain when they are created.

The public key will be accessible but the private keys are kept secure.

    NOTE: Private keys are currently kept in memory and may not be secure. An improved security strategy is in the works.

Using the public key you can give the Domain access to "Machines". Assuming your machine allows SSH access. The Domain's public key will have to be pasted in your machines "authorized_keys" file.

This is the only tedious step then you can have Shipster automatically connect to your machine and install Shipster, giving each installation access to each other.

This mean you only have to manually install Shipster the first time.

**Currently tested on Mac OS X and Node.js.**

### Installation Prerequisites:
 * Operating system with a shell, and a SSH server.
 * Node.js, or possibly io.js.
 * redis and git.

### Core Dependencies:
 * gulp
 * Swarm
 * redis
 * dnode
 * debug
 * config
 * chai
 * pm2
 * pem
 * uuid
 * cli
 * lodash
 * hapi
 * node-http-api

### Client Prerequisites:
 * Modern HTML5 web browser.

### Client Dependencies:
 * aurelia framework
 * bootstrap
 * D3
 * font-awesome
 * jQuery

## First time installation.

> git clone lalafoo
> npm install
> npm start

Open your browser and go to [https://localhost:5600](https://localhost:5600)

#### Running tests.

> npm test

## ISC LICENSE

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that no above copyright notice and this permission notice appear in all copies.

**THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.**
