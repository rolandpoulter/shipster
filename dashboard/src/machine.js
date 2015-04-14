/*jshint esnext:true*/

import {WebAPI} from './web-api';
import {App} from './app';

export class Machine {
  static inject() { return [App, WebAPI]; }

  constructor(app, api) {
    this.app = app;
    this.api = api;
  }

  activate(params, qs, config) {
    this.app.selectedMenu = this.app.selectedMenu || 'machines';
    this.app.selectedType = 'machines';
    this.app.selectedSlug = params.m;

    return this.api.getMachineDetails(params.m).then(machine => {
      this.app.selectedId = machine.id;
      this.machine = machine;
      config.navModel.title = machine.name || machine.id;
      this.originalJSON = JSON.stringify(machine);

      var domainIds = Object.keys(machine.status);
      this.linkedDomains = domainIds.map(domainId =>
        this.app.domains.filter(x => x.id === domainId)[0]);

      this.availableDomains = this.app.domains.filter(domain =>
        domainIds.indexOf(domain.id) === -1);
    });
  }

  get canSave() {
    return this.machine.id && this.machine.name && !this.api.isRequesting;
  }

  save() {
    this.api.saveMachine(this.machine).then(machine => {
      this.machine = machine;
      this.originalJSON = JSON.stringify(this.machine);
    });
  }

  canDeactivate() {
    if(this.originalJSON != JSON.stringify(this.machine)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');

      if (!result) {
        this.app.selectedId = this.machine.id;
      }

      return result;
    }

    return true;
  }
}
