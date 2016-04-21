(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
  const API_KEY = '&key=AIzaSyAWlJoUn2DS8XUYilLXZE8dxYEXbo6dnaE';
  const TOAST_DUR = 4000;

  var userId = $.url().param('userId');
  var sensorName = $('#sensor-name');
  var sensorLocation = $('#sensor-location');
  var sensorDescription = $('#sensor-description');
  var sensorProject = $('#sensor-project');
  var sensorCoords;
  var gMap;

  $('select').material_select();

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
          accountBtn.attr('href', 'user.html?userId=' + result.id);
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
      window.location = 'user.html?userId=' + userId;
    })
    .fail(function(err) {
      console.error(err)
    });
  }

  $('#setup-sensor').click(function() {
    if (!sensorCoords) {
      Materialize.toast('Please check your address on the map', TOAST_DUR);
      return;
    }

    var name = sensorName.val();
    var projectKey = sensorProject.val();
    $.ajax({
      type: 'POST',
      url: API_URL + 'projects/' + projectKey + '/sensors',
      data: {
        userId: userId,
        name: name,
        description: sensorDescription.val(),
        address: sensorLocation.val(),
        // XXX: Need String type here.
        coords: JSON.stringify(sensorCoords),
        // TOOD: Please add the google token here.
        token: 'Google token'
      },
      dataType: 'json'
    })
    .done(function(result) {
      if (result.result === 'success') {
        window.location = './user.html?userId=' + userId;
      } else {
        alert(result.message);
      }
    })
    .fail(function(err) {
      console.error(err)
    });
  });

  $('#check-addr-btn').click(function() {
    var address = sensorLocation.val();

    if (!address) {
      return;
    }

    var formattedAddr = address.split(' ').join('+');
    $.ajax({
      url: GEOCODE_URL + formattedAddr + API_KEY,
    })
    .done(function(data) {
      if (!data.results[0]) {
        return;
      }

      sensorCoords = data.results[0].geometry.location;
      gMap = new google.maps.Map(document.getElementById('location-map'), {
        zoom: 16,
        center: sensorCoords
      });

      var gMapMarker = new google.maps.Marker({
        position: sensorCoords,
        map: gMap,
        draggable:true,
        animation: google.maps.Animation.DROP
      });

      google.maps.event.addListener(gMapMarker, 'dragend', function() {
        sensorCoords = gMapMarker.getPosition().toJSON();
      });
    })
    .fail(function(error) {
      console.error(error);
    });
  });

  function initMap() {
    gMap = new google.maps.Map(document.getElementById('location-map'), {
      zoom: 1,
      center: {lat: 0, lng: 0}
    });
  }

  exports.initMap = initMap;
  exports.onSignIn = onSignIn;

})(window);
