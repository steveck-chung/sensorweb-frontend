(function(){
  $('.modal-trigger').leanModal();

  $('select').material_select();

  $('#request-a-sensor').click(function(e){
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $("#want-a-nearby-sensor").offset().top - 64,
      easing: "easeout"
    }, 700);
    return false;
  });

  $('#suggest').click(function(e){
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $("#propose-a-new-project").offset().top - 64,
      easing: "easeout"
    }, 700);
    return false;
  });
})();
