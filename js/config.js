'use strict';

(function(exports) {
  exports.DEBUG = false;
  exports.DRAW_DAQI_LINE = false;

  if (exports.DEBUG) {
    exports.API_URL = 'http://localhost:8081/';
    exports.SENSORWEB_URL = 'http://localhost:8080/';
  } else {
    exports.API_URL = 'http://api.sensorweb.io/';
    exports.SENSORWEB_URL = 'http://sensorweb.io/';
  }
}(window));
