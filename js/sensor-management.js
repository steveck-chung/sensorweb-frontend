(function(){
  $.ajax({
    url: 'evanxd/sensors',
  })
  .done(function(sensors) {
    var sensorList = $('#sensor-list ul');
    var html = '';
    sensors.forEach(function(sensor) {
      var html = '<li class="collection-item">' +
                   '<div>' +
                     sensor.name + '<a href="sensor-detail.html" class="secondary-content"><i class="material-icons">info</i></a>' +
                   '</div>' +
                 '</li>';
      sensorList.append(html);
    });
  })
  .fail(function(error) {
    console.error(error);
  })
})();
