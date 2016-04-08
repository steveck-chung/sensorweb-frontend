(function(exports){

  const SENSOR_LIST_MARKUP = '<a href=${url} class="collection-item">${name}<button id="edit-device" class="waves-effect waves-light btn-large btn-control right" href="sensor-setup.html?userId=evanxd"><i class="material-icons left">mode_edit</i><span>Edit</span></button></a>';
  var fakeDataMode = true;

  function renderSensorList(sensors) {
    $.tmpl(SENSOR_LIST_MARKUP, sensors).appendTo("#sensor-list");
  }

  if (fakeDataMode) {
    renderSensorList([
      {
        name: 'sensor1',
        url: 'sensor-detail.html?id=1'
      },
      {
        name: 'sensor2',
        url: 'sensor-detail.html?id=2'
      },
      {
        name: 'sensor3',
        url: 'sensor-detail.html?id=3'
      }
    ]);
  }

  // Fetch sensor list
  $.ajax({
    url: 'sensors',
  })
  .done(function(sensors) {
    latestSensors = sensors;
    updateMap(latestSensors);
  })
  .fail(function(error) {
    console.error(error);
  });

  // Fetch sensors for specific user
  $.ajax({
    url: 'projects/' + userId +  '/sensors',
  })
  .done(renderSensorList)
  .fail(function(error) {
    console.error(error);
  });

  // Fetch projects for the user
  $.ajax({
    url: 'projects',
  })
  .done(function(projects) {

  })
  .fail(function(error) {
    console.error(error);
  });

})(window);
