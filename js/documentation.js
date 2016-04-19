(function(){

	var $toc = $('.toc .collection');
	var $tocItems = $toc.find('.collection-item');

	//pin menu
	$toc.pushpin({ top: $('.toc').offset().top, offset: 68});

	//animated scrolling
	$.localScroll({
		queue:true,
		duration:200,
		hash:true,
		onAfter: function(element) {
		  	$tocItems.removeClass('active');
			$toc.find('[href=#'+element.attr('id')+']').addClass('active');
		}
	});

	//set active menu item
	var waypoints = $('h2, h3').waypoint({
	  handler: function(direction) {
	  	$tocItems.removeClass('active');
	  	$toc.find('[href=#'+this.element.id+']').addClass('active');
	  }
	});

})();
