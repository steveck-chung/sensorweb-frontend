(function(){
  var userId = $.url().param('userId');
  var sensorName = $('#sensor-name');
  var sensorLocation = $('#sensor-location');
  var sensorDescription = $('#sensor-description');
  var sensorProject = $('#sensor-project');

  $('select').material_select();

  $('#setup-sensor').click(function() {
    var name = sensorName.val();
    $.post('sensors', {
      userId: userId,
      projectId: sensorProject.val(),
      name: name,
      description: sensorDescription.val(),
      coords: sensorLocation.val()
    })
    .done(function(result) {
      window.location = './sensor-management.html';
    })
    .fail(function(err) {
      console.error(err)
    });
  });
})();
