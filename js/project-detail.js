(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });



  var fakeDataMode = true;
  var projectId = $.url().param('id');
  var latestSensors;

  var gMap;
  var markerMap = new Map();

  var ctx = $("#sensor-data-chart").get(0).getContext("2d");

  var dataChartContainer = document.getElementById("sensor-data-chart-container");
  var dataChart;
  var chartName = $('#sensor-information .name');
  var chartDescription = $('#sensor-information .description');
  var chartValue = $('#sensor-information .value');
  var chartLatestUpdate = $('#sensor-information .latest-update');
  var chartCloseBtn = $('#chart-close-btn');

  chartCloseBtn.click(function () {
    dataChartContainer.classList.add('hide');
    dataChart && dataChart.destroy();
  });

  $(window).load(function handleClientLoad() {
    var auth = gapi.auth2.init({
      client_id: '463509681101-3mv6658rkbcq52dst0t3h17desmq6e8l.apps.googleusercontent.com'
    });
    var loginAccountBtn = $('login-account-btn');

    function btnState(isSignedIn) {
      if (isSignedIn) {
        loginAccountBtn.text('My account');
        //TODO: Fetch user ID and set correct url
        loginAccountBtn.attr('href', 'user-detail.html');
      } else {
        loginAccountBtn.text('Log In');
        loginAccountBtn.attr('href', '#google-sign-in-modal');
      }
    }

    btnState(auth.isSignedIn.get());
    auth.isSignedIn.listen(btnState);
  });

  function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var auth = googleUser.getAuthResponse();
    //TODO: create user in DB and get user profile

    $('#google-sign-in-modal').closeModal();
  }

  function dataConvertion(dataArray) {
    var config = {
      type: 'line',
      data: {
        datasets: [{
          label: "PM2.5 value",
    			 pointBorderWidth: .2,
          fill: false,
          data: dataArray.slice(dataArray.length-30,dataArray.length).map(function(d) {
            return { x: moment(d.datetime).format('LLL'), y: d.pm25Index };
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
              // labelString: 'Time'
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

  function updateMap(sensors) {
    if (!gMap || !sensors) {
      return;
    }

    sensors.forEach(function(sensor, index) {
      if (markerMap.has(sensor.id)) {
        return;
      }

      var gMapMarker = new google.maps.Marker({
        position: sensor.location,
        map: gMap,
        title: sensor.name,
        zIndex: index +1
      });

      gMapMarker.addListener('click', function() {
        chartName.text(sensor.name);
        chartDescription.text(sensor.description);
        chartValue.text(sensor.pm25Index);
        chartLatestUpdate.text(sensor.latestUpdate);
        dataChartContainer.classList.remove('hide');

        if (fakeDataMode) {
          var fakeArray = [];
          for (var i=100; i>0; i--) {
            fakeArray.push({
              datetime: Date.now() - i * 60000,
              pm25Index: Math.random() * 100
            })
          }
          dataChart = new Chart(ctx, dataConvertion(fakeArray));
          // $('#sensor-information').height($('#sensor-chart').height());
          return;
        }

        $.ajax({
          url: 'sensors/' + sensor.id + '/data',
        })
        .done(function(dataArray) {
          dataChart = new Chart(ctx, dataConvertion(dataArray));
        })
        .fail(function(error) {
          console.error(error);
        });
      });

      markerMap.set(sensor.id, gMapMarker);
    });
  }

  function initMap() {
    // mapAPIReady = true;
    //
    // if (!latestSensorData) {
    //   return;
    // }
    // TODO: var location = latestSensorData.location;
    var location = {lat: 25.032506, lng: 121.5674536};

    gMap = new google.maps.Map(document.getElementById('sensors-location-map'), {
      zoom: 14,
      center: location,
      scrollwheel: false
    });

    if (fakeDataMode) {
      latestSensors = [
        {
          id: 1,
          name: 'Test 1',
          description: 'Test 1\'s data',
          location: {lat: 25.032506, lng: 121.5674536},
          pm25Index: Math.random()*100,
          latestUpdate: Date.now()
        },
        {
          id: 2,
          name: 'Test 2',
          description: 'Test 2\'s data',
          location: {lat: 25.0, lng: 121.6674536},
          pm25Index: Math.random()*100,
          latestUpdate: Date.now()
        },
        {
          id: 3,
          name: 'Test 3',
          description: 'Test 3\'s data',
          location: {lat: 25.05, lng: 121.5},
          pm25Index: Math.random()*100,
          latestUpdate: Date.now()
        }
      ];
    }

    updateMap(latestSensors);
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

  // Fetch project detail, should set project ID as parameter
  $.ajax({
    url: 'projects',
  })
  .done(function(projects) {

  })
  .fail(function(error) {
    console.error(error);
  });

  // Fetch user list, should set project ID as parameter
  $.ajax({
    url: 'users',
  })
  .done(function(users) {

  })
  .fail(function(error) {
    console.error(error);
  });

  exports.initMap = initMap;
  exports.onSignIn = onSignIn;

})(window);
