(function(){
  var sensorId = $.url().param('id');
  $.ajax({
    url: 'sensors/' + sensorId,
  })
  .done(function(sensor) {
    var sensorName = $('#sensor-name');
    var sensorDescription = $('#sensor-description');
    sensorName.html(sensor[0].name);
    sensorDescription.text(sensor[0].description);
  })
  .fail(function(error) {
    console.error(error);
  })
})();
