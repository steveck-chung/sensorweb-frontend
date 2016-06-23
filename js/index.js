'use strict';

(function(exports){
  $('.button-collapse').sideNav();
  $('.modal-trigger').leanModal();
  $('select').material_select();

  $('#learn').click(function(e){
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $('#what').offset().top - 64,
      easing: 'easeout'
    }, 700);
    return false;
  });

  $('#subscribe').click(function(e){
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $('#index-contact-banner').offset().top - 64,
      easing: 'easeout'
    }, 700);
    return false;
  });

  $('.modal-trigger').click(function(){
    $('input.select-dropdown').attr('placeholder','Pick any that applies');
  });

  // XXX: A trick to enable the login feature.
  /* global Konami */
  new Konami(function() {
    var auth = gapi.auth2.getAuthInstance();

    if (auth.isSignedIn.get()) {
      $('#nav').append('<li><a href="getting-started.html">Getting Started</a></li><li class="login"><a id="login-btn" href="#google-sign-in-modal" class="modal-trigger hide">Log In</a></li><li class="login"><a id="account-btn">My account</a></li>');
      var email = auth.currentUser.get().getBasicProfile().getEmail();
      $.ajax({
        url: API_URL + 'users?email=' + email,
        dataType: 'jsonp'
      })
      .done(function(result) {
        $('#login-btn').addClass('hide');
        $('#account-btn').removeClass('hide');
        $('#account-btn').attr('href', 'user.html?id=' + result.userId);
      })
      .fail(function(err) {
        console.error(err);
      });
    } else {
      $('#nav').append('<li><a href="getting-started.html">Getting Started</a></li><li class="login"><a id="login-btn" href="#google-sign-in-modal" class="modal-trigger">Log In</a></li><li class="login"><a id="account-btn" class="hide">My account</a></li>');
    }
    $('#login-btn').leanModal();
  });

  var latestSensors;
  var gMap;
  var markerMap = new Map();

  function getGeolocation() {
    return new Promise(function(resolve, reject) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(pos);
        }, function() {
          reject('Browser unable to get current location');
        });
      } else {
        reject('Browser doesn\'t support Geolocation');
      }
    });
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
        // Place the invliad marker to bottom
        zIndex: sensor.pm25Index ? index + 1 : 0,
        icon: DAQI[getDAQIStatus(sensor.pm25Index)].iconURL
      });
      bound.extend(
        new google.maps.LatLng(Number(coords.lat), Number(coords.lng))
      );
      gMapMarker.addListener('click', function() {
        window.location = 'sensor.html?id=' + sensor._id;
      });
      markerMap.set(sensor._id, gMapMarker);
    });

    gMap.setCenter(bound.getCenter());
    gMap.fitBounds(bound);

    getGeolocation().then(function(pos) {
      gMap.setCenter(pos);
      gMap.setZoom(16/* TODO: Refine this part to set correct scale*/);
    }, function(e) {
      console.log(e);
    });
  }

  function initMap() {
    var mapElement = document.getElementById('sensors-location-map');
    gMap = new google.maps.Map(mapElement, {
      streetViewControl: false,
      scrollwheel: false
    });
    updateMap(latestSensors);
  }

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
