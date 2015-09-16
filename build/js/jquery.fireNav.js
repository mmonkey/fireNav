/*! fireNav (0.3.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
;(function ($, window, document, undefined) {
	var fireNav = "fireNav";
	var defaults = {
		
	};

	function FireNav (el, options, sel) {
		
	}

	FireNav.prototype = {

	}

	$.fn[fireNav] = function (options) {
		var sel = this.selector;
		return this.each(function () {

			if ($.data(this, fireNav)) {
				$(this).data(fireNav).destroy();
				$(this).removeData(fireNav);
			}
			
			$.data(this, fireNav, new FireNav(this, options, sel));
		});
	};

	window.fireNav = FireNav;

})(jQuery, window, document);