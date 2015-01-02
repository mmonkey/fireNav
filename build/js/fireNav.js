/* fireNav (0.1.0). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
(function ( window, undefined ) {

	function fireNav(options) {

		this.defaults = {
			selector: "#fireNav",
			type: "Off-Canvas"
		};
		
		this.options = options || {};
		
		for (var opt in this.defaults) {
			if (this.defaults.hasOwnProperty(opt) && !this.options.hasOwnProperty(opt)) {
				this.options[opt] = this.defaults[opt];
			}
		}

		this.init = function init() {
			console.log(this.options.selector);
		}
	}

	window.fireNav = fireNav;

})( window );