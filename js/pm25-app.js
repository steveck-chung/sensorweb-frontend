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
  var chartName = $('#sensor-information .name');
  var chartDescription = $('#sensor-information .description');
  var chartValue = $('#sensor-information .value');
  var chartLatestUpdate = $('#sensor-information .latest-update');
  var chartCloseBtn = $('#chart-close-btn');

  chartCloseBtn.click(function () {
    dataChartContainer.classList.add('hide');
    if (dataChart) {
      dataChart.destroy();
    }
  });

  function dataConvertion(dataArray) {
    var config = {
      type: 'line',
      data: {
        datasets: [{
          label: 'PM2.5 value',
          pointBorderWidth: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: 'grey',
          fill: true,
          data: dataArray.map(function(d) {
            return { x: moment(d.datetime).format(CHART_FORMAT),
                     // FIXME: Remove `pm25Index`.
                     y: d.pm25Index || d.data.pm25 };
          })
        }]
      },
      options: {
        responsive: true,
        hover: {
          animationDuration: 0
        },
        elements: {
          line: {
            borderWidth: 2
          },
          point: {
            radius: 2,
            borderWidth: 2
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            scaleLabel: {
              display: true
              // labelString: 'Time'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'PM2.5 index(μg/m)'
            },
            ticks: {
              beginAtZero: true,
              suggestedMax: 100
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
        zIndex: index + 1,
        icon: DAQI[getDAQIStatus(sensor.pm25Index)].iconURL
      });

      gMapMarker.addListener('click', function() {
        chartName.text(sensor.name);
        chartDescription.text(sensor.description);
        chartValue.text(sensor.pm25Index);
        chartValue.attr('data-status', getDAQIStatus(sensor.pm25Index));
        chartLatestUpdate.text(moment(sensor.latestUpdate).fromNow());
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

    function onSuccess(position) {
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
    }

    navigator.geolocation.getCurrentPosition(onSuccess, null, opts);
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
