(function(){
  $('.button-collapse').sideNav();
  $('.parallax').parallax();
})();


$('#learn').click(function(e){
	e.preventDefault();
	$('html, body').animate({
        scrollTop: $("#what").offset().top-64,
        easing: "easeinout"
    }, 700);
    return false;
});
    