(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  var fakeDataMode = true;

  var latestUpdateElm = $('#latest-update');
  var pm25Elm = $('#pm25');
  var sensorDataElm = $('#sensor-data');
  var sensorId = $.url().param('id');

  var mapAPIReady = false;
  var infowindow;

  // google map realted.
  var latestSensorData;
  var gMap;
  var gMapMarker;

  // Chart related
  var dataChart;

  if (fakeDataMode) {
    latestSensorData = {
      name: "Mozilla Taiwan",
      description: "Mozilla Taiwan Taipei office",
      latestUpdate: moment().format(),
      pm25Index: Math.random() * 100
    }

    var ctx = $("#sensor-data-chart").get(0).getContext("2d");
    var fakeArray = [];

    for (var i=300; i>0; i--) {
      fakeArray.push({
        datetime: Date.now() - i * 60000,
        pm25Index: Math.random() * 100
      })
    }
    dataChart = new Chart(ctx, dataConvertion(fakeArray));
  }

  $(window).load(function handleClientLoad() {
    var auth = gapi.auth2.getAuthInstance();
    var loginAccountBtn = $('#login-account-btn');

    function btnState(isSignedIn) {
      if (isSignedIn) {
        loginAccountBtn.text('My account');
        //TODO: Fetch user ID and set correct url
        loginAccountBtn.removeClass('modal-trigger');
        loginAccountBtn.attr('href', 'user-detail.html');
      } else {
        loginAccountBtn.text('Log In');
        loginAccountBtn.addClass('modal-trigger');
        loginAccountBtn.attr('href', '#google-sign-in-modal');
      }
    }

    btnState(auth.isSignedIn.get() || auth.currentUser.get().isSignedIn());
    auth.isSignedIn.listen(btnState);
  });

  function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var auth = googleUser.getAuthResponse();
    //TODO: create user in DB and get user profile

    $('#google-sign-in-modal').closeModal();
  }

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
    mapAPIReady = true;

    if (!latestSensorData) {
      return;
    }
    // TODO: var location = latestSensorData.location;
    var location = {lat: 25.032506, lng: 121.5674536};

    gMap = new google.maps.Map(document.getElementById('sensor-location-map'), {
      zoom: 16,
      center: location
    });

    infowindow = new google.maps.InfoWindow();

    gMapMarker = new google.maps.Marker({
      position: location,
      map: gMap,
      title: latestSensorData.name
    });

    updateInfo(latestSensorData);

    infowindow.open(gMap, gMapMarker);

    gMapMarker.addListener('click', function() {
      infowindow.open(gMap, gMapMarker);
    });
  }

  function dataConvertion(dataArray) {
    var config = {
      type: 'line',
      data: {
        datasets: [{
          label: "PM2.5 value",
    			 pointBorderWidth: 1,
          fill: false,
          data: dataArray.map(function(d) {
            return { x: moment(d.datetime).format(), y: d.pm25Index };
          })
        }]
      },
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            type: "time",
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }, ],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'PM2.5 index(μg/m)'
            }
          }]
        }
      }
    };
    return config;
  }

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

    // Init the map if API is ready
    if (mapAPIReady) {
      initMap();
    }
  })
  .fail(function(error) {
    console.error(error);
  });

  $.ajax({
    url: 'sensors/' + sensorId + '/data',
  })
  .done(function(dataArray) {
    if (dataArray.length === 0) {
      return;
    }

    dataChart && dataChart.destroy();

    var ctx = $("#sensor-data-chart").get(0).getContext("2d");
    dataChart = new Chart(ctx, dataConvertion(dataArray));
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
      if (sensor.latestUpdate !== undefined &&
          sensor.pm25Index !== undefined) {
        latestUpdateElm.text(sensor.latestUpdate);
        pm25Elm.text(sensor.pm25Index);

        latestSensorData = sensor;
        updateInfo(sensor);

        var formattedDate = moment(sensor.latestUpdate).format();
        if (!dataChart) {
          var ctx = $("#sensor-data-chart").get(0).getContext("2d");
          dataChart = new Chart(ctx, dataConvertion([sensor]));
        } else if (formattedDate > dataChart.data.datasets[0].data[0].x) {
          dataChart.data.datasets[0].data.unshift({
            x: moment(sensor.latestUpdate).format(),
            y: sensor.pm25Index
          });
          dataChart.update();
        }
      }
    });
  }, 5000);

  exports.initMap = initMap;
  exports.onSignIn = onSignIn;

})(window);
