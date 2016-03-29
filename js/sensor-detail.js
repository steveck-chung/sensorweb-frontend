(function(exports){
  var latestUpdateElm = $('#latest-update');
  var pm25Elm = $('#pm25');
  var sensorDataElm = $('#sensor-data');
  var sensorId = $.url().param('id');

  var infoSet = false;
  var infowindow;

  // google map realted.
  var latestSensorData;
  var gMap;
  var gMapMarker;

  $.ajax({
    url: 'sensors/' + sensorId,
  })
  .done(function(sensors) {
    var sensor = sensors[0];
    var sensorNameElm = $('#sensor-name');
    var sensorKeyElm = $('#sensor-key')
    var sensorDescriptionElm = $('#sensor-description');
    sensorNameElm.text(sensor.name);
    sensorKeyElm.text(sensor._id);
    sensorDescriptionElm.text(sensor.description);
    latestUpdateElm.text(sensor.latestUpdate);
    pm25Elm.text(sensor.pm25Index);
    latestSensorData = sensor;

    if (infowindow) {
      updateInfo(sensor);
      infowindow.open(gMap, gMapMarker);

      gMapMarker.addListener('click', function() {
        infowindow.open(gMap, gMapMarker);
      });
    }
  })
  .fail(function(error) {
    console.error(error);
  });

  $.ajax({
    url: 'sensors/' + sensorId + '/data',
  })
  .done(function(dataArray) {
    var html = '';
    dataArray.forEach(function(data) {
      sensorDataElm.append('<li class="collection-item">' +
        new Date(data.datetime) + ', ' + data.pm25Index + '</li>');
    });
  })
  .fail(function(error) {
    console.error(error);
  });

  function updateInfo(sensor) {
    var newContent = '<div id="map-infowindow">'+
      '<h5 id="info-title">' + sensor.name + '</h5>'+
      '<div id="bodyContent">'+
      '<p id="info-description">' + sensor.description + '</p>'+
      '<p>pm2.5 index: <span id="info-pm25-index">' + sensor.pm25Index + '</span></p>'+
      '<p>Last update: <span id="info-last-update">' + sensor.latestUpdate + '</span></p>'+
      '</div>'+
      '</div>';

    infowindow.setContent(newContent);
  }

  function initMap() {
    // TODO: sensor's location
    var location = {lat: 25.032506, lng: 121.5674536};

    gMap = new google.maps.Map(document.getElementById('sensor-location-map'), {
      zoom: 16,
      center: location
    });

    infowindow = new google.maps.InfoWindow();

    gMapMarker = new google.maps.Marker({
      position: location,
      map: gMap,
      title: 'Mozilla Taiwan'
    });

    if (latestSensorData) {
      updateInfo(latestSensorData);

      infowindow.open(gMap, gMapMarker);

      gMapMarker.addListener('click', function() {
        infowindow.open(gMap, gMapMarker);
      });
    }
  }

  // XXX: Hack to sync the latest data.
  setInterval(function() {
    $.ajax({
      url: 'sensors/' + sensorId,
    })
    .done(function(sensors) {
      var sensor = sensors[0];
      if (sensor.latestUpdate !== undefined &&
          sensor.pm25Index !== undefined) {
        latestUpdateElm.text(sensor.latestUpdate);
        pm25Elm.text(sensor.pm25Index);
        sensorDataElm.prepend('<li class="collection-item">' +
          new Date(sensor.latestUpdate) + ', ' + sensor.pm25Index + '</li>');

        latestSensorData = sensor;
        updateInfo(sensor);
      }
    });
  }, 2500);

  // XXX: FE testing code
  // setInterval(function() {
  //
  //   if (infowindow) {
  //     updateInfo({
  //       name: 'MOZ',
  //       description: 'ooo',
  //       pm25Index: Math.random() * 100,
  //       latestUpdate: Date.now()
  //     });
  //   }
  //
  // }, 10000);

  exports.initMap = initMap;

})(window);
