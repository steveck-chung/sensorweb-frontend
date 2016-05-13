'use strict';

(function(exports){
  const CHART_FORMAT = 'LLL';

  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  var latestUpdateElm = $('#latest-update');
  var pm25Elm = $('#pm25');
  var sensorId = $.url().param('id');

  var mapAPIReady = false;
  var infowindow;

  // google map realted.
  var latestSensorData;
  var gMap;
  var gMapMarker;

  // Chart related
  var dataChart;
  var gradient;

  function updateInfo(sensor) {
    var status = getDAQIStatus(sensor.pm25Index);
    var newContent =
    /* jshint ignore:start */
      '<div id="map-infowindow">'+
        '<h5 id="info-title">' + sensor.name + '</h5>'+
        '<div id="bodyContent">'+
          '<p id="info-description">' + sensor.description + '</p>'+
          '<p>PM2.5: <span class="value" id="info-pm25-index" data-status="' +
          status +'">' + sensor.pm25Index + '</span>' +
          '<p class="info">Air quality is '+ '<span class="status" data-status="'+status+'">'+DAQI[status].banding+'</span>'+'<span> ( <a href="https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info&pollutant=pm25#pollutant" target="_blank">' +
          '<a href="http://taqm.epa.gov.tw/taqm/tw/fpmi.htm" target="_blank">Taiwan\'s Practice</a> )</p>' +
          '<p class="info">Last Update: <span id="info-last-update">' + moment(sensor.latestUpdate).format(CHART_FORMAT) + '</span></p>'+
        '</div>'+
      '</div>';
    /* jshint ignore:end */
    infowindow.setContent(newContent);
  }

  function initMap() {
    mapAPIReady = true;

    if (!latestSensorData) {
      return;
    }
    var coords = latestSensorData.coords;
    var location = coords ?
      {lat: Number(coords.lat), lng: Number(coords.lng)} :
      {lat: 25.032506, lng: 121.5674536};
    var index = latestSensorData.pm25Index;

    gMap = new google.maps.Map(document.getElementById('sensor-location-map'), {
      zoom: 16,
      streetViewControl: false,
      center: location,
      scrollwheel: false
    });
    gMap.panBy(0,-100);

    infowindow = new google.maps.InfoWindow();

    gMapMarker = new google.maps.Marker({
      position: location,
      map: gMap,
      title: latestSensorData.name,
      icon: DAQI[getDAQIStatus(index)].iconURL
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
          label: 'PM2.5 value',
          pointBorderWidth: 0,
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBorderWidth: 0,
          pointBackgroundColor: '#5cc7B9',
          pointHoverBackgroundColor: '#1cbcad',
          backgroundColor: gradient,//"rgba(136,216,205,0.5)",
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
        maintainAspectRatio: false,
        hover: {
          mode: 'single',
          animationDuration: 0
        },
        elements: {
          line: {
            borderWidth: .1,
            borderColor: '#88d8cd'
          },
          point: {
            radius: 0,
            borderWidth: 0,
            hitRadius: 10
          }
        },
        scaleLabel: {
          fontColor: '#7d7d7d'
        },
        scales: {
          xAxes: [{
            type: 'time',
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true
            },
            time: {
              round: true,
              unitStepSize: 100,
              displayFormats: {
                'hour': 'MMM D, H'
              }
            }
          } ],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'PM2.5 (μg/m)'
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

  $.ajax({
    url: API_URL + 'sensors/' + sensorId,
    dataType: 'jsonp'
  })
  .done(function(sensors) {
    var sensor = sensors[0];
    var sensorNameElm = $('#sensor-name');
    var sensorIdElm = $('#sensor-id');
    var sensorOwner = $('#sensor-owner');
    var sensorDescriptionElm = $('#sensor-description');
    sensorNameElm.text(sensor.name);
    sensorIdElm.text(sensor._id);
    sensorDescriptionElm.text(sensor.description);
    sensorOwner.html('<a href="user.html?id=' + sensor.userId +
      '">' + sensor.userId + '</a>');
    latestUpdateElm.text(moment(sensor.latestUpdate).fromNow());
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
    url: API_URL + 'sensors/' + sensorId + '/data',
    dataType: 'jsonp'
  })
  .done(function(dataArray) {
    if (dataArray.length === 0) {
      return;
    }

    if (dataChart) {
      dataChart.destroy();
    }

    var ctx = $('#sensor-data-chart').get(0).getContext('2d');
    gradient = ctx.createLinearGradient(0,520,0,0);
    gradient.addColorStop(.70,'#c3b3e4');
    gradient.addColorStop(.54,'#faafce');
    gradient.addColorStop(.36,'#ffde9b');
    gradient.addColorStop(0,'#94dbbb');
    ctx.canvas.height = 400;
    dataChart = new Chart(ctx, dataConvertion(dataArray));
    console.log(dataChart);
  })
  .fail(function(error) {
    console.error(error);
  });

  var widget = document.querySelector('#widget');
  widget.setAttribute('src', SENSORWEB_URL + 'widget.html?id=' + sensorId);
  var widgetInput = document.querySelector('#widget-input');
  widgetInput.setAttribute('value', '<iframe width="125" height="125" src="' + SENSORWEB_URL +
    'widget.html?id=' + sensorId + '" frameborder="0" scrolling="no"></iframe>');

  // XXX: Hack to sync the latest data.
  setInterval(function() {
    $.ajax({
      url: API_URL + 'sensors/' + sensorId,
      dataType: 'jsonp'
    })
    .done(function(sensors) {
      var sensor = sensors[0];
      var status = getDAQIStatus(sensor.pm25Index);
      if (sensor.latestUpdate !== undefined &&
          sensor.pm25Index !== undefined) {
        latestUpdateElm.text(moment(sensor.latestUpdate).fromNow());
        pm25Elm.text(sensor.pm25Index);

        latestSensorData = sensor;
        gMapMarker.setIcon(DAQI[status].iconURL);
        updateInfo(sensor);

        var formattedDate = moment(sensor.latestUpdate).format(CHART_FORMAT);
        if (!dataChart) {
          var ctx = $('#sensor-data-chart').get(0).getContext('2d');
          dataChart = new Chart(ctx, dataConvertion([sensor]));
        } else if (formattedDate > dataChart.data.datasets[0].data[0].x) {
          dataChart.data.datasets[0].data.unshift({
            x: moment(sensor.latestUpdate).format(CHART_FORMAT),
            y: sensor.pm25Index
          });
          dataChart.update();
        }
      }
    });
  }, 60000);

  exports.initMap = initMap;

})(window);
