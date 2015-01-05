/* fireNav (0.1.0). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
(function ( window, undefined ) {

	function fireNav(options) {

		this.defaults = {
			container: "#fireNav",
			type: "Off-Canvas"
		};

		// Merge defaults into options
		this.options = options || {};
		for (var opt in this.defaults) {
			if (this.defaults.hasOwnProperty(opt) && !this.options.hasOwnProperty(opt)) {
				this.options[opt] = this.defaults[opt];
			}
		}

		// Set up Velocity
		var V;
		if(window.jQuery) { V = $.Velocity; } else { V = Velocity; }

		this.nav = document.querySelectorAll(this.options.container)[0];

		this.init = function init() {
			console.log(this.options.container);
		}
	}

	window.fireNav = fireNav;

})( window );