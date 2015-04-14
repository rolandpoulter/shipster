/*jshint esnext:true*/

var latency = 500;

var domains = [
  {
    id: 'd1',
    machineIds: ['m1'],
    url: 'http://shipify.io',
    name: 'shipify.io',
    description: 'Shipster Documentation',
    publicKey: 'LALA'
  },
  {
    id: 'd2',
    machineIds: ['m2'],
    url: 'http://johndoe.name',
    name: 'johndoe.name',
    description: 'John Doe',
    publicKey: 'FOO FOO'
  }
];

var ships = [
  {
    id: 's1',
    platformIds: ['p1'],
    name: 'one',
    description: 'something something somthing',
    manifest: {}
  },
  {
    id: 's2',
    platformIds: ['p1'],
    name: 'two',
    description: 'dark side',
    manifest: {
      src: [{git: 'git://'}],
      cmd: []
    }
  }
];

var platforms = [
  {
    id: 'p1',
    os: 'linux',
    name: 'DebianVM',
    description: 'Debian Virtual Machine'
  }
];

var machines = [
  {
    id: 'm1',
    platformId: 'p1',
    ip: '0.0.0.0',
    name: 'Local',
    description: 'The same machine shipster is running on.',
    status: {
      d1: 'online'
    },
    architecture: 'amd64',
    resources: {
      cpus: 1,
      disk: '5gb',
      memory: '1024mb'
    },
    stats: [{
      time: Date.now(),
      cpus: 0.5,
      disk: '20mb',
      memory: '140mb'
    }]
  },
  {
    id: 'm2',
    platformId: 'p1',
    ip: '255.255.255.255',
    name: 'Remote',
    description: 'Some VM somwhere.',
    status: {
      d2: 'offline'
    },
    architecture: 'amd64',
    resources: {
      cpus: 1,
      disk: '5gb',
      memory: '1024mb'
    },
    stats: [{
      time: Date.now(),
      cpus: 0.5,
      disk: '20mb',
      memory: '140mb'
    }]
  }
];

var operations = [
  {
    id: 'o1',
    domainId: 'd1',
    machineId: 'm1',
    shipId: 's1',
    name: 'Task One',
    description: 'installation',
    status: 'running',
    stats: [{
      time: Date.now(),
      cpus: 0.5,
      disk: '20mb',
      memory: '140mb'
    }],
    command: 'task2',
    args: [],
    env: {}
  },
  {
    id: 'o2',
    domainId: 'd2',
    machineId: 'm2',
    shipId: 's2',
    name: 'Task Two',
    description: 'enhance... enhance... enhance',
    status: 'running',
    stats: [{
      time: Date.now(),
      cpus: 0.5,
      disk: '20mb',
      memory: '140mb'
    }],
    command: 'task2',
    args: [],
    env: {}
  }
];

export class WebAPI {
  // Dashboard

  getDashboardData() {
    var domains    = this.getDomains(),
        ships      = this.getShips(),
        platforms  = this.getPlatforms(),
        machines   = this.getMachines(),
        operations = this.getOperations();

    return new Promise(resolve => {
      var count = 5,
          api = this;

      domains.then(   list => { domains    = list; if (--count === 0) finish(); });
      ships.then(     list => { ships      = list; if (--count === 0) finish(); });
      platforms.then( list => { platforms  = list; if (--count === 0) finish(); });
      machines.then(  list => { machines   = list; if (--count === 0) finish(); });
      operations.then(list => { operations = list; if (--count === 0) finish(); });

      function finish() {
        return resolve({
          domains:    domains.map(function (domain) {
            domain.machines = api.getFromSlugList(machines, domain.machineIds);
            // domain.operations = operations.filter(x => x.domainId === domain.id);
            return domain;
          }),
          ships:      ships.map(function (ship) {
            ship.platforms = api.getFromSlugList(platforms, ship.platformIds);
            // ship.operations = operations.filter(x => x.shipId === ship.id);
            return ship;
          }),
          platforms:  platforms.map(function (platform) {
            platform.machines = machines.filter(x => x.platformId === platform.id);
            return platform;
          }),
          machines:   machines.map(function (machine) {
            machine.platform = api.getFromSlug(platforms, machine.platformId);
            // machine.operations = operations.filter(x => x.machineId === machine.id);
            return machine;
          }),
          operations: operations.map(function (op) {
            op.domain  = api.getFromSlug(domains,   op.domainId);
            op.ship    = api.getFromSlug(ships,     op.shipId);
            op.machine = api.getFromSlug(machines,  op.machineId);
            op.machine.platform = api.getFromSlug(platforms, op.machine.platformId);
            return op;
          })
        });
      }
    });
  }

  getFromSlugList(list, slugList) {
    return slugList.map(slug => list.filter(x => x.id == slug || x.name === slug)[0]);
  }

  getFromSlug(list, slug) {
    return list.filter(x => x.id == slug || x.name === slug)[0];
  }

  // Domains

  getDomains() {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(domains)));

        this.isRequesting = false;
      }, latency);
    });
  }

  getDomainDetails(id) {
    this.isRequesting = true;

    var api = this;

    return new Promise(resolve => {
      setTimeout(() => {
        let found = this.getFromSlug(domains, id);
        found.machines = api.getFromSlugList(machines, found.machineIds);

        resolve(JSON.parse(JSON.stringify(found)));

        this.isRequesting = false;
      }, latency);
    });
  }

  saveDomain(domain) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        var instance = JSON.parse(JSON.stringify(domain));

        let found = domains.filter(x => x.id == domain.id)[0];

        if (found) {
          let index = domains.indexOf(found);
          domains[index] = instance;
        }

        else {
          instance.id = domains.length;
          domains.push(instance);
        }

        this.isRequesting = false;

        resolve(instance);
      }, latency);
    });
  }

  // Ships

  getShips() {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(ships)));

        this.isRequesting = false;
      }, latency);
    });
  }

  getShipDetails(id) {
    this.isRequesting = true;

    var api = this;

    return new Promise(resolve => {
      setTimeout(() => {
        let found = this.getFromSlug(ships, id);
        found.platforms = api.getFromSlugList(platforms, found.platformIds);

        resolve(JSON.parse(JSON.stringify(found)));

        this.isRequesting = false;
      }, latency);
    });
  }

  saveShip(ship) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        var instance = JSON.parse(JSON.stringify(ship));

        let found = machines.filter(x => x.id == ship.id)[0];

        if (found) {
          let index = ships.indexOf(found);
          ships[index] = instance;
        }

        else {
          instance.id = ships.length;
          ships.push(instance);
        }

        this.isRequesting = false;

        resolve(instance);
      }, latency);
    });
  }

  // Platforms

  getPlatforms() {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(platforms)));

        this.isRequesting = false;
      }, latency);
    });
  }

  getPlatformDetails(id) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        let found = this.getFromSlug(platforms, id);
        // found.machines = machines.filter(x => x.platformId === found.id);

        resolve(JSON.parse(JSON.stringify(found)));

        this.isRequesting = false;
      }, latency);
    });
  }

  savePlatform(platform) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        var instance = JSON.parse(JSON.stringify(platform));

        let found = platforms.filter(x => x.id == platform.id)[0];

        if (found) {
          let index = platforms.indexOf(found);
          platforms[index] = instance;
        }

        else {
          instance.id = platforms.length;
          platforms.push(instance);
        }

        this.isRequesting = false;

        resolve(instance);
      }, latency);
    });
  }

  // Machines

  getMachines() {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(machines)));

        this.isRequesting = false;
      }, latency);
    });
  }

  getMachineDetails(id) {
    this.isRequesting = true;

    var api = this;

    return new Promise(resolve => {
      setTimeout(() => {
        let found = this.getFromSlug(machines, id);
        found.platform = api.getFromSlug(platforms, found.platformId);

        resolve(JSON.parse(JSON.stringify(found)));

        this.isRequesting = false;
      }, latency);
    });
  }

  saveMachine(machine) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        var instance = JSON.parse(JSON.stringify(machine));

        let found = machines.filter(x => x.id == machine.id)[0];

        if (found) {
          let index = machines.indexOf(found);
          machines[index] = instance;
        }

        else {
          instance.id = machines.length;
          machines.push(instance);
        }

        this.isRequesting = false;

        resolve(instance);
      }, latency);
    });
  }

  // Operations

  getOperations() {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(operations)));

        this.isRequesting = false;
      }, latency);
    });
  }

  getOperationDetails(id) {
    this.isRequesting = true;

    var api = this;

    return new Promise(resolve => {
      setTimeout(() => {
        let found = this.getFromSlug(operations, id);
        found.domain   = api.getFromSlug(domains,   found.domainId);
        found.ship     = api.getFromSlug(ships,     found.shipId);
        found.machine  = api.getFromSlug(machines,  found.machineId);
        found.machine.platform = api.getFromSlug(platforms, found.machine.platformId);

        resolve(JSON.parse(JSON.stringify(found)));

        this.isRequesting = false;
      }, latency);
    });
  }

  saveOperation(operation) {
    this.isRequesting = true;

    return new Promise(resolve => {
      setTimeout(() => {
        var instance = JSON.parse(JSON.stringify(operation));

        let found = operations.filter(x => x.id == machine.id)[0];

        if (found) {
          let index = machines.indexOf(found);
          operations[index] = instance;
        }

        else {
          instance.id = operations.length;
          operations.push(instance);
        }

        this.isRequesting = false;

        resolve(instance);
      }, latency);
    });
  }
}
