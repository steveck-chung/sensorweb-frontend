(function(exports){
  $('.button-collapse').sideNav();
  $('.modal-trigger').leanModal();
  $('select').material_select();

  $('#learn').click(function(e){
    e.preventDefault();
    $('html, body').animate({
          scrollTop: $("#what").offset().top - 64,
          easing: "easeout"
      }, 700);
      return false;
  });

  $('#subscribe').click(function(e){
    e.preventDefault();
    $('html, body').animate({
          scrollTop: $("#index-contact-banner").offset().top - 64,
          easing: "easeout"
      }, 700);
      return false;
  });

  $('.modal-trigger').click(function(e){
    $('input.select-dropdown').attr('placeholder','Pick any that applies');
  });

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
          accountBtn.attr('href', 'user-detail.html?userId=' + result.id);
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
      window.location = 'user-detail.html?userId=' + userId;
    })
    .fail(function(err) {
      console.error(err)
    });
  }

  exports.onSignIn = onSignIn;

  // XXX: A trick to enable the login feature.
  new Konami(function() {
    var auth = gapi.auth2.getAuthInstance();

    if (auth.isSignedIn.get()) {
      $('#nav').append('<li class="login"><a id="login-btn" href="#google-sign-in-modal" class="modal-trigger hide">Log In</a></li><li class="login"><a id="account-btn">My account</a></li>');
      var email = auth.currentUser.get().getBasicProfile().getEmail();
      $.ajax({
        url: API_URL + 'users?email=' + email,
        dataType: 'jsonp'
      })
      .done(function(result) {
        $('#login-btn').addClass('hide');
        $('#account-btn').removeClass('hide');
        $('#account-btn').attr('href', 'user-detail.html?userId=' + result.userId);
      })
      .fail(function(err) {
        console.error(err)
      });
    } else {
      $('#nav').append('<li class="login"><a id="login-btn" href="#google-sign-in-modal" class="modal-trigger">Log In</a></li><li class="login"><a id="account-btn" class="hide">My account</a></li>');
    }
    $('#login-btn').leanModal();
  });
})(window);
