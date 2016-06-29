'use strict';
/**
 * General config about:
 * DEBUG: if true, you could test the website/widget/API from localhost. But you
 * will need to setup frontend/backend to your local at first.
 */

(function(exports) {
  exports.DEBUG = false;

  if (exports.DEBUG) {
    exports.API_URL = 'http://localhost:8081/';
    exports.SENSORWEB_URL = 'http://localhost:8080/';
  } else {
    exports.API_URL = 'http://api.sensorweb.io/';
    exports.SENSORWEB_URL = 'http://sensorweb.io/';
  }
}(window));
