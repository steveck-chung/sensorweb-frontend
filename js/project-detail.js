(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const fakeDataMode = false;
  const CHART_FORMAT = '';
  const CONTRIBUTOR_MARKUP ='<div class="col s6 m3 l2"><div class="card"><div class="card-image"><img src="https://avatars3.githubusercontent.com/u/3013038?v=3&s=460"><span class="card-title">${name}</span></div></div></div>';

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
    var auth = gapi.auth2.getAuthInstance();

    if (!auth) {
      return;
    }

    var loginBtn = $('#login-btn');
    var accountBtn = $('#account-btn');

    function btnState(isSignedIn) {
      if (isSignedIn) {
        var email = auth.currentUser.get().getBasicProfile().getEmail();
        $.ajax({
          url: API_URL + 'users?email=' + email,
          dataType: 'jsonp'
        })
        .done(function(result) {
          loginBtn.addClass('hide');
          accountBtn.removeClass('hide');
          accountBtn.attr('href', 'user-detail.html?userId=' + result.id);
        })
        .fail(function(err) {
          console.error(err)
        });
      } else {
        accountBtn.addClass('hide');
        loginBtn.removeClass('hide');
      }
    }

    btnState(auth.isSignedIn.get() || auth.currentUser.get().isSignedIn());
    auth.isSignedIn.listen(btnState);
  });

  function onSignIn(googleUser) {
    var userId = $('#user-id').val();

    if (!userId) {
      return;
    }

    var auth = googleUser.getAuthResponse();
    var profile = googleUser.getBasicProfile();
    var userData = {
      // token: auth.access_token, Do we really need this?
      id: userId,
      name: profile.getName(),
      email: profile.getEmail(),
      picture: profile.getImageUrl()
    };
    //TODO: create user in DB and get user profile

    $('#user-id').text();
    $('#google-sign-in-modal').closeModal();

    $.ajax({
      type: 'POST',
      url: API_URL + 'users',
      data: userData,
      dataType: 'jsonp'
    })
    .done(function() {
      window.location = 'user-detail.html?userId=' + userId;
    })
    .fail(function(err) {
      console.error(err)
    });
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
            return { x: moment(d.datetime).format(CHART_FORMAT), y: d.pm25Index };
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
      if (markerMap.has(sensor._id)) {
        return;
      }

      var coords = sensor.coords;
      var gMapMarker = new google.maps.Marker({
        position: { lat: Number(coords.lat), lng: Number(coords.lng) },
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
          url: 'sensors/' + sensor._id + '/data',
        })
        .done(function(dataArray) {
          dataChart = new Chart(ctx, dataConvertion(dataArray));
        })
        .fail(function(error) {
          console.error(error);
        });
      });

      markerMap.set(sensor._id, gMapMarker);
    });
  }

  function renderContributorList(contributors) {
    $.tmpl(CONTRIBUTOR_MARKUP, contributors).appendTo("#contributor-list");
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

  // Fetch project detail, should set project ID as parameter
  $.ajax({
    url: 'projects/sensorweb/pm25',
  })
  .done(function(project) {
    $('#pm25 .description').text(project.description);
    $('#pm25 .creator').text(project.creator.name);
    // $('#pm25 .last-update').text(project.detail);
    $('#pm25 .created-date').text(project.createDate);
  })
  .fail(function(error) {
    console.error(error);
  });

  // Fetch sensor list
  $.ajax({
    url: 'projects/sensorweb/pm25/sensors',
  })
  .done(function(sensors) {
    latestSensors = sensors;
    updateMap(latestSensors);
  })
  .fail(function(error) {
    console.error(error);
  });

  // Fetch user list, should set project ID as parameter
  $.ajax({
    url: 'projects/sensorweb/pm25/contributors',
  })
  .done(function(contributors) {
    $('#pm25 .contributors').text(contributors.length);
    renderContributorList(contributors);
  })
  .fail(function(error) {
    console.error(error);
  });

  exports.initMap = initMap;
  exports.onSignIn = onSignIn;

})(window);
