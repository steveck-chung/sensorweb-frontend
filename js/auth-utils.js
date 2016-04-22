(function(exports){
  const USER_URL = 'user.html?userId=';

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
          dataType: 'json'
        })
        .done(function(result) {
          loginBtn.addClass('hide');
          accountBtn.removeClass('hide');
          accountBtn.attr('href', USER_URL + result.id);
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
      token: auth.access_token,
      id: userId,
      name: profile.getName(),
      email: profile.getEmail(),
      picture: profile.getImageUrl()
    };
    //TODO: create user in DB and get user profile

    $('#user-id').text();
    $('#google-sign-in-modal').closeModal();

    $.ajax({
      method: 'POST',
      url: API_URL + 'users',
      data: userData,
      dataType: 'json'
    })
    .done(function() {
      window.location = USER_URL + userId;
    })
    .fail(function(err) {
      console.error(err)
    });
  }

  exports.onSignIn = onSignIn;

})(window);
