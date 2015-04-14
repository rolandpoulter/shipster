/*jshint esnext:true*/

import {App} from './app';

export class Dashboard {
  static inject() { return [App]; }

  constructor(app) {
    this.app = app;
  }

  activate() {
    this.app.selectedMenu = this.app.selectedMenu || 'domains';
    this.app.selectedType = null;
    this.app.selectedSlug = null;
    this.app.selectedId = null;
  }
}
