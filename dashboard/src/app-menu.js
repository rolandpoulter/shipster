/*jshint esnext:true*/

import {Behavior} from 'aurelia-framework';

import {App} from './app';

export class AppMenu {
  static metadata() {
    // debugger;
    return Behavior
      .withProperty('collection',               null, 'collection')
      .withProperty('collectionSlug',           null, 'collection-slug')
      .withProperty('collectionName',           null, 'collection-name')
      .withProperty('collectionNameSingular',   null, 'collection-name-singular')
      .withProperty('appSelectMethod',          null, 'app-select-method')
      .withProperty('extraDescriptionProperty', null, 'extra-description-property')
      .withProperty('nameBeginsWithVowel',      null, 'name-begins-with-vowel');
  }

  static inject() { return [App]; }

  constructor(app) {
    this.app = app;
    // debugger;
  }

  attached() {
    // debugger;
  }

  select(item) {
    // debugger;
    this.app[this.appSelectMethod](item);
  }

  add(item) {
    // debugger;
  }

  cancel(event) {
    // HACK to avoid an uncaught exception from jquery/bootstrap
    event.stopPropagation(); event.preventDefault();
    this.newInstance = null;
  }
}
