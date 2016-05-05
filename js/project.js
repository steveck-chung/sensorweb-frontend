'use strict';

(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const CHART_FORMAT = 'LLL';
  const CONTRIBUTOR_MARKUP ='<div class="col s6 m3 l2"><div class="card">' +
    '<a href="user.html?id=${userId}"><div class="card-image">' +
    '<img src="${picture}"></div></div></a>' +
    '<p class="center-align">${name}</p></div>';


  // TODO: Maybe we should remove it once server-side rendering is ready?
  // var projectId = $.url().param('id');
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
            }
          } ],
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

    var bound = new google.maps.LatLngBounds();

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

      bound.extend(
        new google.maps.LatLng(Number(coords.lat), Number(coords.lng))
      );

      gMapMarker.addListener('click', function() {
        chartName.html(
          '<a href="./sensor.html?id=' + sensor._id + '">' +
          sensor.name + '</a>'
        );
        chartDescription.text(sensor.description);
        chartValue.text(sensor.pm25Index);
        chartValue.attr('data-status', getDAQIStatus(sensor.pm25Index));
        chartLatestUpdate.text(moment(sensor.latestUpdate).fromNow());
        dataChartContainer.classList.remove('hide');
        $('#sensor-details').attr('href','./sensor.html?id=' + sensor._id);

        $.ajax({
          url: API_URL + 'sensors/' + sensor._id + '/data',
          dataType: 'jsonp'
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

    gMap.setCenter(bound.getCenter());
  }

  function renderContributorList(contributors) {
    $.tmpl(CONTRIBUTOR_MARKUP, contributors).appendTo('#contributor-list');
  }

  function initMap() {
    var mapElement = document.getElementById('sensors-location-map');

    gMap = new google.maps.Map(mapElement, {
      zoom: 11,  // TODO: Find a better way to define the zoom scale
      streetViewControl: false,
      scrollwheel: false
    });

    updateMap(latestSensors);
  }

  // Fetch project detail, should set project ID as parameter
  $.ajax({
    url: API_URL + 'projects/sensorweb/pm25',
    dataType: 'jsonp'
  })
  .done(function(project) {
    $('#pm25 .description').text(project.description);
    $('#pm25 .creator').text(project.creator.name);
    // $('#pm25 .last-update').text(project.detail);
    $('#pm25 .created-date').text(moment(project.createDate).format('LL'));
  })
  .fail(function(error) {
    console.error(error);
  });

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

  // Fetch user list, should set project ID as parameter
  $.ajax({
    url: API_URL + 'projects/sensorweb/pm25/contributors',
    dataType: 'jsonp'
  })
  .done(function(contributors) {
    $('#pm25 .contributors').text(contributors.length);
    renderContributorList(contributors);
  })
  .fail(function(error) {
    console.error(error);
  });

  exports.initMap = initMap;

})(window);
