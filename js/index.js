(function(){
  $('.button-collapse').sideNav();
  //$('.parallax').parallax();
  $(document).ready(function(){
    $('.modal-trigger').leanModal();
    $('select').material_select();
  });
})();


$('#learn').click(function(e){
	e.preventDefault();
	$('html, body').animate({
        scrollTop: $("#what").offset().top-64,
        easing: "easeout"
    }, 700);
    return false;
});

$('#subscribe').click(function(e){
	e.preventDefault();
	$('html, body').animate({
        scrollTop: $("#index-contact-banner").offset().top-64,
        easing: "easeout"
    }, 700);
    return false;
});

$('.modal-trigger').click(function(e){
	console.log("!");
	$('input.select-dropdown').attr('placeholder','Pick any that applies');
});