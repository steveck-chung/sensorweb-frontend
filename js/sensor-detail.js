(function(){
  var sensorId = $.url().param('id');
  $.ajax({
    url: 'sensors/' + sensorId,
  })
  .done(function(sensors) {
    var sensor = sensors[0];
    var sensorName = $('#sensor-name');
    var sensorDescription = $('#sensor-description');
    var latestUpdate = $('#latest-update');
    var pm25 = $('#pm25');
    sensorName.text(sensor.name);
    sensorDescription.text(sensor.description);
    latestUpdate.text(sensor.latestUpdate);
    pm25.text(sensor.pm25Index)
  })
  .fail(function(error) {
    console.error(error);
  })
})();
