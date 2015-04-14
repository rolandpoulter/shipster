/*jshint esnext:true*/

import {Router} from 'aurelia-router';
import {WebAPI} from './web-api';

export class App {
  static inject() { return [Router, WebAPI]; }

  constructor(router, api) {
    this.router = router;
    this.api = api;

    this.iconMap = {
      domains: 'fa-globe',
      machines: 'fa-hdd-o',
      platforms: 'fa-dot-circle-o',
      ships: 'fa-rocket',
      operations: 'fa-tasks'
    };

    this.router.configure(config => {
      config.title = 'Shipster';

      var home = ['', 'dash', 'dash/:a'];
      config.map([
        { route: home,   moduleId: 'dashboard', title: 'Dashboard' },
        { route: 'd/:d', moduleId: 'domain',    title: 'Domain' },
        { route: 's/:s', moduleId: 'ship',      title: 'Ship' },
        { route: 'p/:p', moduleId: 'platform',  title: 'Platform' },
        { route: 'm/:m', moduleId: 'machine',   title: 'Machine' },
        { route: 'o/:o', moduleId: 'operation', title: 'Operation' }
      ]);
    });
  }

  getType(type) {
    return this[type] || null;
  }

  getById(id, type) {
    var list = this.getType(type);
    return list && list.filter(x => x.id === id)[0] || null;
  }

  getSlugFromId(id, type) {
    var entity = this.getById(id, type);
    return entity && (entity.name || entity.id) || '';
  }

  selectEntity(entity, route, skipNav) {
    if (!entity) { return; }
    this.selectedId = entity.id;

    if (skipNav) { return; }
    this.router.navigate(route + '/' + (entity.name || entity.id));
  }

  selectDomain(domain, sn) {
    this.selectEntity(domain, 'd', sn);
  }

  selectShip(ship, sn) {
    this.selectEntity(ship, 's', sn);
  }

  selectPlatform(platform, sn) {
    this.selectEntity(platform, 'p', sn);
  }

  selectMachine(machine, sn) {
    this.selectEntity(machine, 'm', sn);
  }

  selectOperation(operation, sn) {
    this.selectEntity(operation, 'o', sn);
  }

  activate(params, qs, config) {
    console.log('app activated', params, qs, config);
    return this.api.getDashboardData().then(dashData => {
      console.log('dashboard data:', dashData);
      this.domains = dashData.domains;
      this.ships = dashData.ships;
      this.platforms = dashData.platforms;
      this.machines = dashData.machines;
      this.operations = dashData.operations;
    });
  }

  attached() {
    window.$('[data-hover="tooltip"]').tooltip();
    window.$('[data-toggle="popover"]').popover();
  }
}
