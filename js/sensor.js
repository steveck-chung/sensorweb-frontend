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

  function updateInfo(sensor) {
    var status = getDAQIStatus(sensor.pm25Index);
    var newContent =
    /* jshint ignore:start */
      '<div id="map-infowindow">'+
        '<h5 id="info-title">' + sensor.name + '</h5>'+
        '<div id="bodyContent">'+
          '<p id="info-description">' + sensor.description + '</p>'+
          '<p>PM2.5: <span id="info-pm25-index" data-status="' +
          status +'">' + sensor.pm25Index + '</span>' +
          '<span> ( <a href="https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info&pollutant=pm25#pollutant" target="_blank">' +
          '<b>' + DAQI[status].banding + '</b></a></span>, <a href="http://taqm.epa.gov.tw/taqm/tw/fpmi.htm" target="_blank">Taiwan\'s Practice</a> )</p>' +
          '<p>Last Update: <span id="info-last-update">' + moment(sensor.latestUpdate).format(CHART_FORMAT) + '</span></p>'+
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
      center: location
    });

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
        tooltips: {
          enabled: true,
          custom: function(tooltip) {
            // debugger
            // Tooltip Element
            var tooltipEl = $('#chartjs-tooltip');

            if (!tooltipEl[0]) {
              $('body').append('<div id="chartjs-tooltip"></div>');
              tooltipEl = $('#chartjs-tooltip');
            }

            // Hide if no tooltip
            if (!tooltip.opacity) {
              tooltipEl.css({
                opacity: 0
              });
              $('.chartjs-wrap canvas')
                .each(function(index, el) {
                  $(el).css('cursor', 'default');
                });
              return;
            }

            $(this._chart.canvas).css('cursor', 'pointer');

            // Set caret Position
            tooltipEl.removeClass('above below no-transform');
            if (tooltip.yAlign) {
              tooltipEl.addClass(tooltip.yAlign);
            } else {
              tooltipEl.addClass('no-transform');
            }

            // Set Text
            if (tooltip.body) {
              var innerHtml = [
                (tooltip.beforeTitle || []).join('\n'),
                (tooltip.title || []).join('\n'),
                (tooltip.afterTitle || []).join('\n'),
                (tooltip.beforeBody || []).join('\n'),
                (tooltip.body || []).join('\n'),
                (tooltip.afterBody || []).join('\n'),
                (tooltip.beforeFooter || []).join('\n'),
                (tooltip.footer || []).join('\n'),
                (tooltip.afterFooter || []).join('\n')
              ];
              tooltipEl.html(innerHtml.join('\n'));
            }

            // Find Y Location on page
            var top = 0;
            if (tooltip.yAlign) {
              if (tooltip.yAlign == 'above') {
                top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
              } else {
                top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
              }
            }

            var offset = $(this._chart.canvas).offset();

            // Display, position, and set styles for font
            tooltipEl.css({
              opacity: 1,
              width: tooltip.width ? (tooltip.width + 'px') : 'auto',
              left: offset.left + tooltip.x + 'px',
              top: offset.top + top + 'px',
              fontFamily: tooltip._fontFamily,
              fontSize: tooltip.fontSize,
              fontStyle: tooltip._fontStyle,
              padding: tooltip.yPadding + 'px ' + tooltip.xPadding + 'px'
            });
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          } ],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'PM2.5 (μg/m)'
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
    dataChart = new Chart(ctx, dataConvertion(dataArray));
  })
  .fail(function(error) {
    console.error(error);
  });

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
