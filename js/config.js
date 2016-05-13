'use strict';

(function(exports) {
  exports.DEBUG = false;
  exports.DRAW_DAQI_LINE = false;

  if (exports.DEBUG) {
    exports.API_URL = 'http://localhost:8081/';
  } else {
    exports.API_URL = 'http://api.sensorweb.io/';
  }
}(window));
