/*jshint esnext:true*/

import {WebAPI} from './web-api';
import {App} from './app';

export class Ship {
  static inject() { return [App, WebAPI]; }

  constructor(app, api) {
    this.app = app;
    this.api = api;
  }

  activate(params, qs, config) {
    this.app.selectedMenu = this.app.selectedMenu || 'ships';
    this.app.selectedType = 'ships';
    this.app.selectedSlug = params.s;

    return this.api.getShipDetails(params.s).then(ship => {
      this.app.selectedId = ship.id;
      this.ship = ship;
      config.navModel.title =  ship.name || ship.id;
      this.originalJSON = JSON.stringify(ship);

      this.linkedPlatforms = ship.platformIds.map(platformId =>
        this.app.platforms.filter(x => x.id === platformId)[0]);

      this.availablePlatforms = this.app.platforms.filter(platform =>
        ship.platformIds.indexOf(platform.id) === -1);
    });
  }

  get canSave() {
    return this.ship.id && this.ship.name && !this.api.isRequesting;
  }

  save() {
    this.api.saveShip(this.ship).then(ship => {
      this.ship = ship;
      this.originalJSON = JSON.stringify(this.ship);
    });
  }

  canDeactivate() {
    if(this.originalJSON != JSON.stringify(this.ship)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');

      if(!result){
        this.app.selectedId = this.ship.id;
      }

      return result;
    }

    return true;
  }
}
