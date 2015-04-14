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
    this.app.selectedMenu = this.app.selectedMenu || 'operations';
    this.app.selectedType = 'operations';
    this.app.selectedSlug = params.o;

    return this.api.getOperationDetails(params.o).then(operation => {
      this.app.selectedId = operation.id;
      this.operation = operation;
      config.navModel.title =  operation.name || operation.id;
      this.originalJSON = JSON.stringify(operation);
    });
  }

  get canSave() {
    return this.operation.id && this.operation.name && !this.api.isRequesting;
  }

  save() {
    this.api.saveOperation(this.operation).then(operation => {
      this.operation = operation;
      this.originalJSON = JSON.stringify(this.operation);
    });
  }

  canDeactivate() {
    if(this.originalJSON != JSON.stringify(this.operation)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');

      if(!result){
        this.app.selectedId = this.operation.id;
      }

      return result;
    }

    return true;
  }
}
