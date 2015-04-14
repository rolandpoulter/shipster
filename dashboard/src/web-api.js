/*jshint esnext:true*/

var async = window.SHIPSTER.async,
    swarm = window.SHIPSTER.swarm,
    model = window.SHIPSTER.model;

var domains,
    machines,
    operations,
    platforms,
    ships;

export class WebAPI {
  constructor() {
    this.swarm_client_host = swarm.client();
  }

  // Dashboard

  getDashboardData() {
    var dashboard_promises = [
      this.getDomains(),
      this.getShips(),
      this.getPlatforms(),
      this.getMachines(),
      this.getOperations()
    ];

    return new Promise((resolve, reject) => {
      Promise.all(dashboard_promises).catch(reject).then(dashboard_data => {
        async.auto({
          domains: (done) => {
            var domains = dashboard_data[0];
            async.map(domains, (domain, next) => { domain._machines(() => next(null, domain)); }, done);
            // domain.operations = operations.filter(x => x.domainID === domain.id);
          },
          ships: (done) => {
            var ships = dashboard_data[1];
            async.map(ships, (ship, next) => { ship._platforms(() => next(null, ship)); }, done);
            // ship.operations = operations.filter(x => x.shipID === ship.id);
          },
          platforms: ['machines', (done, data) => {
            var platforms = dashboard_data[2],
                machines = data.machines;
            platforms.forEach(platform => {
              platform.machines = machines.filter(machine => machine.platformID === platform.id);
            });
            done(null, platforms);
          }],
          machines: (done) => {
            var machines = dashboard_data[3];
            async.map(machines, (machine, next) => { machine._platform(() => next(null, machine)); }, done);
          },
          operations: (done) => {
            var operations = dashboard_data[4];
            async.forEach(operations, (operation, next) => {
              async.auto({
                domain: (cb) => operation._domain(() => cb()),
                machine: (cb) => operation._machine(() => cb()),
                ship: (cb) => operation._ship(() => cb())
              }, next);
            }, (err) => err ? done(err) : done(null, operations));
          }
        }, (err, data) => err ? reject(err) : resolve(data));
      });
      //
      // var api = this,
      //     count = 5;
      // domains.then(   list => { domains    = list; if (--count === 0) { finish(); } });
      // ships.then(     list => { ships      = list; if (--count === 0) { finish(); } });
      // platforms.then( list => { platforms  = list; if (--count === 0) { finish(); } });
      // machines.then(  list => { machines   = list; if (--count === 0) { finish(); } });
      // operations.then(list => { operations = list; if (--count === 0) { finish(); } });
      // function finish() {

        // return resolve({
        //   domains:    domains.map(function (domain) {
        //     domain.machines = api.getFromSlugList(machines, domain.machineIDs);
        //     // domain.operations = operations.filter(x => x.domainID === domain.id);
        //     return domain;
        //   }),
        //   ships:      ships.map(function (ship) {
        //     ship.platforms = api.getFromSlugList(platforms, ship.platformIDs);
        //     // ship.operations = operations.filter(x => x.shipID === ship.id);
        //     return ship;
        //   }),
        //   platforms:  platforms.map(function (platform) {
        //     platform.machines = machines.filter(x => x.platformID === platform.id);
        //     return platform;
        //   }),
        //   machines:   machines.map(function (machine) {
        //     machine.platform = api.getFromSlug(platforms, machine.platformID);
        //     // machine.operations = operations.filter(x => x.machineID === machine.id);
        //     return machine;
        //   }),
        //   operations: operations.map(function (op) {
        //     op.domain  = api.getFromSlug(domains,   op.domainID);
        //     op.ship    = api.getFromSlug(ships,     op.shipID);
        //     op.machine = api.getFromSlug(machines,  op.machineID);
        //     if (op.machine) {
        //       op.machine.platform = api.getFromSlug(platforms, op.machine.platformID);
        //     }
        //     return op;
        //   })
        // });
    //   }
    });
  }

  getFromSlugList(list, slugList) {
    if (!slugList) {
      return null;
    }
    if (!slugList.map) {
      debugger;
    }
    return slugList.map(slug => list.filter(x => x.id === slug || x.name === slug)[0]);
  }

  getFromSlug(list, slug) {
    return list.filter(x => x.id === slug || x.name === slug)[0];
  }

  // Domains

  getDomains() {
    this.isRequesting = true;
    return new Promise(resolve => {
      domains = model.domains.index(_domains => {
        domains = _domains.map(domain => model.domains.to_client(domain));
        resolve(domains);
        this.isRequesting = false;
      });
    });
  }

  getDomainDetails(id) {
    this.isRequesting = true;
    return new Promise(resolve => {
      model.domains.init(id, null, domain => {
        domain = model.domains.to_client(domain);
        domain._machines(() => {
          resolve(domain);
          this.isRequesting = false;
        });
      });
    });
  }

  saveDomain(domain) {
    // this.isRequesting = true;
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     var instance = JSON.parse(JSON.stringify(domain));
    //     let found = domains.filter(x => x.id === domain.id)[0];
    //     if (found) {
    //       let index = domains.indexOf(found);
    //       domains[index] = instance;
    //     }
    //     else {
    //       instance.id = domains.length;
    //       domains.push(instance);
    //     }
    //     this.isRequesting = false;
    //     resolve(instance);
    //   }, latency);
    // });
  }

  // Ships

  getShips() {
    this.isRequesting = true;
    return new Promise(resolve => {
      ships = model.ships.index(_ships => {
        ships = _ships.map(ship => model.ships.to_client(ship));
        resolve(ships);
        this.isRequesting = false;
      });
    });
  }

  getShipDetails(id) {
    this.isRequesting = true;
    return new Promise(resolve => {
      model.ships.init(id, null, ship => {
        ship = model.ships.to_client(ship);
        ship._platforms(() => {
          resolve(ship);
          this.isRequesting = false;
        });
      });
    });
  }

  saveShip(ship) {
    // this.isRequesting = true;
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     var instance = JSON.parse(JSON.stringify(ship));
    //     let found = machines.filter(x => x.id === ship.id)[0];
    //     if (found) {
    //       let index = ships.indexOf(found);
    //       ships[index] = instance;
    //     }
    //     else {
    //       instance.id = ships.length;
    //       ships.push(instance);
    //     }
    //     this.isRequesting = false;
    //     resolve(instance);
    //   }, latency);
    // });
  }

  // Platforms

  getPlatforms() {
    this.isRequesting = true;
    return new Promise(resolve => {
      platforms = model.platforms.index(_platforms => {
        platforms = _platforms.map(platform => model.platforms.to_client(platform));
        resolve(platforms);
        this.isRequesting = false;
      });
    });
  }

  getPlatformDetails(id) {
    this.isRequesting = true;
    return new Promise(resolve => {
      model.platforms.init(id, null, platform => {
        platform = model.platforms.to_client(platform);
        resolve(platform);
        this.isRequesting = false;
      });
    });
  }

  savePlatform(platform) {
    // this.isRequesting = true;
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     var instance = JSON.parse(JSON.stringify(platform));
    //     let found = platforms.filter(x => x.id === platform.id)[0];
    //     if (found) {
    //       let index = platforms.indexOf(found);
    //       platforms[index] = instance;
    //     }
    //     else {
    //       instance.id = platforms.length;
    //       platforms.push(instance);
    //     }
    //     this.isRequesting = false;
    //     resolve(instance);
    //   }, latency);
    // });
  }

  // Machines

  getMachines() {
    this.isRequesting = true;
    return new Promise(resolve => {
      machines = model.machines.index(_machines => {
        machines = _machines.map(machine => model.machines.to_client(machine));
        resolve(machines);
        this.isRequesting = false;
      });
    });
  }

  getMachineDetails(id) {
    this.isRequesting = true;
    return new Promise(resolve => {
      model.machines.init(id, null, machine => {
        machine = model.machines.to_client(machine);
        machine._platform(() => {
          resolve(machine);
          this.isRequesting = false;
        });
      });
    });
  }

  saveMachine(machine) {
    // this.isRequesting = true;
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     var instance = JSON.parse(JSON.stringify(machine));
    //     let found = machines.filter(x => x.id === machine.id)[0];
    //     if (found) {
    //       let index = machines.indexOf(found);
    //       machines[index] = instance;
    //     }
    //     else {
    //       instance.id = machines.length;
    //       machines.push(instance);
    //     }
    //     this.isRequesting = false;
    //     resolve(instance);
    //   }, latency);
    // });
  }

  // Operations

  getOperations() {
    this.isRequesting = true;
    return new Promise(resolve => {
      operations = model.operations.index(_operations => {
        operations = _operations.map(operation => model.operations.to_client(operation));
        resolve(operations);
        this.isRequesting = false;
      });
    });
  }

  getOperationDetails(id) {
    this.isRequesting = true;
    return new Promise(resolve => {
      model.operations.init(id, null, operation => {
        operation = model.operations.to_client(operation);
        operation._domain(() => {
          operation._ship(() => {
            operation._machine(machine => {
              machine._platform(() => {
                resolve(operation);
                this.isRequesting = false;
              });
            });
          });
        });
      });
    });
  }

  saveOperation(operation) {
    // this.isRequesting = true;
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     var instance = JSON.parse(JSON.stringify(operation));
    //     let found = operations.filter(x => x.id === operation.id)[0];
    //     if (found) {
    //       let index = machines.indexOf(found);
    //       operations[index] = instance;
    //     }
    //     else {
    //       instance.id = operations.length;
    //       operations.push(instance);
    //     }
    //     this.isRequesting = false;
    //     resolve(instance);
    //   }, latency);
    // });
  }
}
