/*jshint esnext:true*/

import {WebAPI} from './web-api';
import {App} from './app';

export class Domain {
  static inject() { return [App, WebAPI]; }

  constructor(app, api) {
    this.app = app;
    this.api = api;
  }

  activate(params, qs, config) {
    this.app.selectedMenu = this.app.selectedMenu || 'domains';
    this.app.selectedType = 'domains';
    this.app.selectedSlug = params.d;

    this.availableMachines = this.app.machines;

    return this.api.getDomainDetails(params.d).then(domain => {
      this.app.selectedId = domain.id;
      this.domain = domain;
      config.navModel.title =  domain.name || domain.id;
      this.originalJSON = JSON.stringify(domain);

      this.availableMachines =
        this.app.machines.filter(
          machine => domain.machines.filter(
            x => x.id === machine.id));
    });
  }

  get canSave() {
    return this.domain.id && this.domain.name && !this.api.isRequesting;
  }

  save() {
    this.api.saveDomain(this.domain).then(domain => {
      this.domain = domain;
      this.originalJSON = JSON.stringify(this.domain);
    });
  }

  canDeactivate() {
    if(this.originalJSON != JSON.stringify(this.domain)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');

      if (!result) {
        this.app.selectedId = this.domain.id;
      }

      return result;
    }

    return true;
  }
}
