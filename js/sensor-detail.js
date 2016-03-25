(function(){
  var latestUpdate = $('#latest-update');
  var pm25 = $('#pm25');
  var sensorData = $('#sensor-data');
  var sensorId = $.url().param('id');

  $.ajax({
    url: 'sensors/' + sensorId,
  })
  .done(function(sensors) {
    var sensor = sensors[0];
    var sensorName = $('#sensor-name');
    var sensorKey = $('#sensor-key')
    var sensorDescription = $('#sensor-description');
    sensorName.text(sensor.name);
    sensorKey.text(sensor._id);
    sensorDescription.text(sensor.description);
    latestUpdate.text(sensor.latestUpdate);
    pm25.text(sensor.pm25Index)
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
      sensorData.append('<li class="collection-item">' +
        new Date(data.datetime) + ', ' + data.pm25Index + '</li>');
    });
  })
  .fail(function(error) {
    console.error(error);
  });

  // XXX: Hack to sync the latest data.
  setInterval(function() {
    $.ajax({
      url: 'sensors/' + sensorId,
    })
    .done(function(sensors) {
      var sensor = sensors[0];
      latestUpdate.text(sensor.latestUpdate);
      pm25.text(sensor.pm25Index);
      sensorData.prepend('<li class="collection-item">' +
        new Date(sensor.latestUpdate) + ', ' + sensor.pm25Index + '</li>');
    });
  }, 2500);
})();
