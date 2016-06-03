'use strict';

(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const CHART_FORMAT = 'LLL';
  const SENSOR_MARKUP ='<li data-id=${id}><div class="info"><p class="name">${name}</p>' +
    '<p class="description"><span>${distanceStr}</span></p>' +
    '<p class="description"><span>${time}</span></p></div>' +
    '<div class="index"><span class="value" data-status=${status}>${value}</span>' +
    '<span class="unit">µg/</span><span class="unit" style="vertical-align: sub">m</span>' +
    '<span style="vertical-align: super">3</span></div></li>';

  var latestSensors;

  var gMap;
  var markerMap = new Map();
  var sensorMap = new Map();

  var ctx = $('#sensor-data-chart').get(0).getContext('2d');

  var dataChartContainer =
    document.getElementById('sensor-data-chart-container');
  var listView = document.getElementById('list-view');

  var listContainer = $('#sensor-list');
  var previousView = {
    type: '',
    scrollTop: 0
  };

  var dataChart;
  var chartStatus = $('#sensor-information .status');
  var chartName = $('#sensor-information .name');
  var chartDescription = $('#sensor-information .description');
  var chartValue = $('#sensor-information .value');
  var chartLatestUpdate = $('#sensor-information .latest-update');
  var navBarTitle = $('#app-navbar h3');
  var backBtn = $('#back-btn');
  var listBtn = $('#list-btn');
  var mapBtn = $('#map-btn');

  backBtn.click(function () {
    if (previousView.type === 'list') {
      listView.classList.remove('hide');
      document.documentElement.scrollTop = previousView.scrollTop;
    }

    updateViewType(previousView.type);
    clearDetailView();
  });

  listBtn.click(function () {
    clearDetailView();

    // Fetch sensor list. Rewrite it to Promise?
    $.ajax({
      url: API_URL + 'projects/sensorweb/pm25/sensors',
      dataType: 'jsonp'
    })
    .done(function(sensors) {
      latestSensors = sensors;
      renderListView(latestSensors);
    })
    .fail(function(error) {
      console.error(error);
    });

    if (dataChart) {
      dataChart.destroy();
    }
  });

  mapBtn.click(function () {
    updateViewType('map');
    clearDetailView();
    clearListView();
  });

  listContainer.click(function(evt) {
    if (evt.target && evt.target.dataset.id) {
      renderDetailView(sensorMap.get(evt.target.dataset.id), {
        type: 'list',
        // Save the scrollTop position to resume the original scroll position.
        scrollTop: document.documentElement.scrollTop
      });
    }

    listView.classList.add('hide');
  });

  function init() {
    // Set location
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

    // Fetch sensor list. Rewrite it to Promise?
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

  function getDistanceFromCenter(pos) {
    var center = gMap.getCenter();

    return google.maps.geometry.spherical.computeDistanceBetween(center, pos);
  }

  function getDistanceString(distance) {
    if (distance < 100) {
      return distance.toFixed() + 'm';
    } else {
      return (distance / 1000).toFixed(1) + 'km';
    }
  }

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

  function updateViewType(view) {
    // Use native dataset instead of jquery data function because it doesn't
    // actually change dataset.
    document.body.dataset.type = view;
    updateNavBar(view);
  }

  function updateNavBar(view) {
    if (view === 'map') {
      navBarTitle.text('SensorWeb');
    } else if (view === 'detail') {
      navBarTitle.text('Sensor Details');
    }
  }

  function updateInfo(opts) {
    var idx = opts.pm25Index;
    var time = opts.latestUpdate;
    var name = opts.name;
    var description = opts.description;

    chartStatus.text(DAQI[getDAQIStatus(idx)].banding);
    chartStatus.attr('data-status', getDAQIStatus(idx));
    chartValue.text(idx || DAQI[getDAQIStatus(idx)].banding);
    chartValue.attr('data-status', getDAQIStatus(idx));
    chartLatestUpdate.text(moment(time).fromNow());
    chartName.text(name);
    chartDescription.text(description);
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
        renderDetailView(sensor, {
          type: 'map'
        });
      });

      markerMap.set(sensor._id, gMapMarker);
    });
  }

  function clearDetailView() {
    previousView = {
      type: '',
      scrollTop: 0
    };
    dataChartContainer.classList.add('hide');
    if (dataChart) {
      dataChart.destroy();
    }
  }

  function renderDetailView(sensor, opts) {
    previousView = opts;
    updateViewType('detail');
    updateInfo({
      pm25Index: sensor.pm25Index,
      latestUpdate: sensor.latestUpdate,
      name: sensor.name,
      description: sensor.description
    });
    $('#sensor-data-chart').get(0).height = document.body.clientWidth * 0.6;

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

    dataChartContainer.classList.remove('hide');
  }

  function clearListView() {
    sensorMap.clear();
    listView.classList.add('hide');
    if (listContainer.html()) {
      listContainer.html('');
    }
  }

  function renderListView(sensors) {
    if (!sensors) {
      return;
    }

    updateViewType('list');

    var sensorData = sensors.map(function(sensor) {
      var coords = sensor.coords;
      var distance = getDistanceFromCenter(
        new google.maps.LatLng(Number(coords.lat), Number(coords.lng))
      );

      // Update sensorMap
      sensorMap.set(sensor._id, sensor);

      return {
        id: sensor._id,
        name: sensor.name,
        time: sensor.latestUpdate ? moment(sensor.latestUpdate).fromNow() : '-----',
        distance: distance,
        distanceStr: getDistanceString(distance),
        status: getDAQIStatus(sensor.pm25Index),
        value: sensor.pm25Index || '---'
      };
    });

    sensorData.sort(function(a, b) {
      return a.distance - b.distance;
    });

    $.tmpl(SENSOR_MARKUP, sensorData).appendTo('#sensor-list');

    listView.classList.remove('hide');
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

  init();
  exports.initMap = initMap;

})(window);
