/*jshint esnext:true*/

import {WebAPI} from './web-api';
import {App} from './app';

export class Platform {
  static inject() { return [App, WebAPI]; }

  constructor(app, api) {
    this.app = app;
    this.api = api;
  }

  activate(params, qs, config) {
    this.app.selectedMenu = this.app.selectedMenu || 'platforms';
    this.app.selectedType = 'platforms';
    this.app.selectedSlug = params.p;

    return this.api.getPlatformDetails(params.p).then(platform => {
      this.app.selectedId = platform.id;
      this.platform = platform;
      config.navModel.title =  platform.name || platform.id;
      this.originalJSON = JSON.stringify(platform);
    });
  }

  get canSave() {
    return this.platform.id && this.platform.name && !this.api.isRequesting;
  }

  save() {
    this.api.savePlatform(this.platform).then(platform => {
      this.platform = platform;
      this.originalJSON = JSON.stringify(this.platform);
    });
  }

  canDeactivate() {
    if(this.originalJSON != JSON.stringify(this.platform)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');

      if(!result){
        this.app.selectedId = this.platform.id;
      }

      return result;
    }

    return true;
  }
}
