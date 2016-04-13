(function(){
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

  // XXX: A trick to enable the login feature.
  new Konami(function() {
    $('#nav').append('<li class="login modal-trigger"><a id="login-btn" href="#google-sign-in-modal">Log In</a></li>');
  });
})();
