'use strict';
/**
 * This authentication utility is for controlling the google sign in process.
 * It requires a modal element defined in page HTML markup with id =
 * "google-sign-in-modal".
 * Basically it could handle the login/account button display in navigation bar
 * and auth dialog display. In the future we'll need to integrate other
 * auth/sign in flow and export unified auth instance.
 */

(function(exports){
  var USER_URL = 'user.html?id=';

  /**
   * Handle login/account button display once the window loaded.
   */
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
          console.error(err);
        });
      } else {
        accountBtn.addClass('hide');
        loginBtn.removeClass('hide');
      }
    }

    btnState(auth.isSignedIn.get() || auth.currentUser.get().isSignedIn());
    auth.isSignedIn.listen(btnState);
  });

  /**
   * Google sign in callback function that needed for sign in button in modal
   * @param {Object} googleUser A object represents one user account. See:
   *  https://developers.google.com/identity/sign-in/web/reference#gapiauth2googleuser
   */
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
      console.error(err);
    });
  }

  exports.onSignIn = onSignIn;

})(window);
