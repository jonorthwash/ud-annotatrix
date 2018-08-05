'use strict';

require('babel-polyfill');

const $ = require('jquery');
const App = require('./app');

// on ready
$(() => { window.app = new App(); });
