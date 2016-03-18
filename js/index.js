(function(){
  $('.button-collapse').sideNav();
  //$('.parallax').parallax();
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
