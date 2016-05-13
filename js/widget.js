/* global SENSORWEB_URL */
'use strict';

(function() {
  var sensorId = $.url().param('id');
  var link = document.querySelector('#link');
  var pm25 = document.querySelector('#pm25');
  var lastUpdate = document.querySelector('#last-update');

  function updatePM25() {
    $.ajax({
      url: API_URL + 'sensors/' + sensorId,
      dataType: 'jsonp'
    })
    .done(function(sensors) {
      var sensor = sensors[0];
      link.setAttribute('href', SENSORWEB_URL + 'sensor.html?id=' + sensorId);
      var pm25Index = sensor.pm25 || sensor.pm25Index;
      if (pm25Index < 10) {
        pm25.style.left = '50px';
      }
      pm25.innerText = pm25Index;
      lastUpdate.innerText =
        moment(sensor.latestUpdate).format('YYYY/MM/DD HH:mm');
    })
    .fail(function(error) {
      console.error(error);
    });
  }

  updatePM25();
  // XXX: Workaround to sync PM2.5 real-time data.
  setInterval(updatePM25, 60000);
}());
