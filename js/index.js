(function(exports){
  $('.button-collapse').sideNav();
  $('.modal-trigger').leanModal();
  $('select').material_select();

  $('#apply-btn').click(function(e){
    e.preventDefault();
    $('html, body').animate({
         scrollTop: $("#apply").offset().top,
         easing: "easeout"
     }, 700);
     return false;
  });

  $('#learn').click(function(e){
    // e.preventDefault();
    var ytplayer = document.getElementById('ytplayer');
    ytplayer.src = 'http://www.youtube.com/embed/AnktUkZOIPQ?autoplay=1';
    // return false;
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

  // XXX: A trick to enable the login feature.
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
        console.error(err)
      });
    } else {
      $('#nav').append('<li><a href="getting-started.html">Getting Started</a></li><li class="login"><a id="login-btn" href="#google-sign-in-modal" class="modal-trigger">Log In</a></li><li class="login"><a id="account-btn" class="hide">My account</a></li>');
    }
    $('#login-btn').leanModal();
  });
})(window);
