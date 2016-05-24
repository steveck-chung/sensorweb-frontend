'use strict';

(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const CHART_FORMAT = 'LLL';

  var latestSensors;

  var gMap;
  var markerMap = new Map();

  var ctx = $('#sensor-data-chart').get(0).getContext('2d');

  var dataChartContainer =
    document.getElementById('sensor-data-chart-container');
  var dataChart;
  var chartStatus = $('#sensor-information .status');
  var chartName = $('#sensor-information .name');
  var chartDescription = $('#sensor-information .description');
  var chartValue = $('#sensor-information .value');
  var chartLatestUpdate = $('#sensor-information .latest-update');
  var navBarTitle = $('#app-navbar h3');
  var backBtn = $('#back-btn');

  backBtn.click(function () {
    updateNavBar('map');
    dataChartContainer.classList.add('hide');
    if (dataChart) {
      dataChart.destroy();
    }
  });

  function dataConvertion(dataArray) {
    var config = ChartUtils.getChartConfig();
    config.data.datasets[0].data = dataArray.map(function(d) {
      return { x: moment(d.datetime).format(CHART_FORMAT),
               // FIXME: Remove `pm25Index`.
               y: d.pm25Index || d.data.pm25 };
    });
    config.options.scales.yAxes[0].scaleLabel.display = false;
    config.options.scales.xAxes[0].time.unitStepSize = 3;
    config.options.tooltips.callbacks = {
      label: function(items) {
        updateInfo({
          pm25Index: items.yLabel,
          latestUpdate: items.xLabel
        });
        return 'PM2.5: ' + items.yLabel;
      }
    };
    return config;
  }

  function updateNavBar(view) {
    if (view === 'map') {
      navBarTitle.text('SensorWeb');
      backBtn[0].classList.add('hide');
    } else if (view === 'detail') {
      navBarTitle.text('Sensor Details');
      backBtn[0].classList.remove('hide');
    }
  }

  function updateInfo(opts) {
    var idx = opts.pm25Index;
    var time = opts.latestUpdate;
    var name = opts.name;
    var description = opts.description;

    chartStatus.text(DAQI[getDAQIStatus(idx)].banding);
    chartStatus.attr('data-status', getDAQIStatus(idx));
    chartValue.text(idx);
    chartValue.attr('data-status', getDAQIStatus(idx));
    chartLatestUpdate.text(moment(time).fromNow());

    if (name) {
      chartName.text(name);
    }
    if (description) {
      chartDescription.text(description);
    }
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
        zIndex: index + 1,
        icon: DAQI[getDAQIStatus(sensor.pm25Index)].iconURL
      });

      gMapMarker.addListener('click', function() {
        updateNavBar('detail');
        updateInfo({
          pm25Index: sensor.pm25Index,
          latestUpdate: sensor.latestUpdate,
          name: sensor.name,
          description: sensor.description
        });
        $('#sensor-data-chart').get(0).height = document.body.clientWidth * 0.6;
        dataChartContainer.classList.remove('hide');

        $.ajax({
          url: API_URL + 'sensors/' + sensor._id + '/data',
          dataType: 'jsonp'
        })
        .done(function(dataArray) {
          //Only render 60 sensor data for mobile view
          dataChart = new Chart(ctx, dataConvertion(
            dataArray.filter(function(data, index) {
              return index % 60 === 0;
            })
          ));
        })
        .fail(function(error) {
          console.error(error);
        });
      });

      markerMap.set(sensor._id, gMapMarker);
    });
  }

  function initMap() {
    console.log('Initialize google map...');

    var location = {lat: 25.032506, lng: 121.5674536};

    gMap = new google.maps.Map(document.getElementById('sensors-location-map'),
      {
        zoom: 14,
        center: location,
        streetViewControl: false,
        scrollwheel: false
      }
    );

    updateMap(latestSensors);
  }

  if (navigator.geolocation) {
    var opts = {
      enableHighAccuracy: true
    };

    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var gMapMarker = new google.maps.Marker({
        position: pos,
        map: gMap,
        zIndex: -1
      });
      gMap.setCenter(pos);
      gMapMarker.setIcon('images/location.png');
    }, null, opts);
  } else {
    console.error('Browser doesn\'t support Geolocation');
  }

  // Fetch project detail, should set project ID as parameter
  // $.ajax({
  //   url: API_URL + 'projects/sensorweb/pm25',
  //   dataType: 'jsonp'
  // })
  // .done(function(project) {
  //   $('#pm25 .description').text(project.description);
  //   $('#pm25 .creator').text(project.creator.name);
  //   // $('#pm25 .last-update').text(project.detail);
  //   $('#pm25 .created-date').text(moment(project.createDate).format('LL'));
  // })
  // .fail(function(error) {
  //   console.error(error);
  // });

  // Fetch sensor list
  $.ajax({
    url: API_URL + 'projects/sensorweb/pm25/sensors',
    dataType: 'jsonp'
  })
  .done(function(sensors) {
    latestSensors = sensors;
    updateMap(latestSensors);
  })
  .fail(function(error) {
    console.error(error);
  });

  exports.initMap = initMap;

})(window);
