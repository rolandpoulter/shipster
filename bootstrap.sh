#!/usr/bin/env bash

apt-get install -y curl build-essential git
curl https://raw.githubusercontent.com/creationix/nvm/v0.23.3/install.sh | bash
nvm install 0.12.0 && nvm use 0.12.0 && nvm alias default 0.12.0
