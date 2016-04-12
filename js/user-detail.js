(function(exports){
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
  });

  const SENSOR_LIST_MARKUP = '<a href=${url} class="collection-item">${name}<button id="edit-device" class="waves-effect waves-light btn-large btn-control right" href="sensor-setup.html?userId=evanxd"><i class="material-icons left">mode_edit</i><span>Edit</span></button></a>';
  var fakeDataMode = true;

  function renderSensorList(sensors) {
    $.tmpl(SENSOR_LIST_MARKUP, sensors).appendTo("#sensor-list");
  }

  if (fakeDataMode) {
    renderSensorList([
      {
        name: 'sensor1',
        url: 'sensor-detail.html?id=1'
      },
      {
        name: 'sensor2',
        url: 'sensor-detail.html?id=2'
      },
      {
        name: 'sensor3',
        url: 'sensor-detail.html?id=3'
      }
    ]);
  }

  $(window).load(function handleClientLoad() {
    var auth = gapi.auth2.getAuthInstance() || gapi.auth2.init({
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

  // Fetch sensors for specific user
  $.ajax({
    url: 'projects/' + userId +  '/sensors',
  })
  .done(renderSensorList)
  .fail(function(error) {
    console.error(error);
  });

  // Fetch projects for the user
  $.ajax({
    url: 'projects',
  })
  .done(function(projects) {

  })
  .fail(function(error) {
    console.error(error);
  });

  exports.onSignIn = onSignIn;

})(window);
