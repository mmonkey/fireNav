/* fireNav (0.1.0). (C) 2014 CJ O'Hara and Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
(function (window, document) {

	FireNav = function() {
	};

	// Set up Velocity
	var V = (window.jQuery) ? $.Velocity : Velocity;

	// Extend defaults into opts, returns options
	function extend(opts, defaults) {
		var options = opts || {};
		for (var opt in defaults) {
			if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
				options[opt] = defaults[opt];
			}
		}
		return options;
	}

	// Creates an event listener
	function listen(elem, type, eventHandle) {
		if (elem === null || typeof(elem) == 'undefined') return;
		if (elem.addEventListener) {
			elem.addEventListener(type, eventHandle, false);
		} else if (elem.attachEven ) {
			elem.attachEvent("on" + type, eventHandle);
		} else {
			elem["on"+type]=eventHandle;
		}
	}

	// Add class to node's classList
	function addClass(node, newClass) {
		if (node.classList) {
				node.classList.add(newClass);
		} else {
				node.className += ' ' + newClass;
		}
	}

	// Remove class from node's classList
	function removeClass(node, rmClass) {
		if (node.classList) {
				node.classList.remove(rmClass);
		} else {
			node.className = node.className.replace(new RegExp('(^|\\b)' + rmClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	// Returns true if node has className
	function hasClass(node, className) {
		var result = false;
		if (node.classList) {
			if(node.classList.contains(className)) {
				result = true;
			}
		}
		return result;
	}

	/**
	 * FireNav.jump function
	 * Adds a smart jump menu that appends to the body
	 */
	FireNav.jump = function(opts) {
		var defaults = {
			sectionClass: ".section",
			position: "right",
			speed: 800
		};

		var options = extend(opts, defaults);
		var sections = document.querySelectorAll(options.sectionClass);
		var nav;

		function constructNav() {
			nav = document.createElement('NAV');
			nav.id = 'jumpNav';

			if(sections.length > 0) {
				for(var i = 0; i < sections.length; i++) {
					var li = document.createElement('LI');
					var a = document.createElement('A');
					a.href = '#' + sections[i].id;
					a.innerText = sections[i].dataset.jumpName;
					li.dataset.jumpClass = sections[i].dataset.jumpClass;
					li.appendChild(a);
					nav.appendChild(li);
				}
			}
			document.body.appendChild(nav);
		}

		function getZoomAmount() {
			var result = 1;
			if (document.body.getBoundingClientRect) {
				var rect = document.body.getBoundingClientRect();
				var physicalW = rect.right - rect.left;
				var logicalW = document.body.offsetWidth;
				result = (physicalW / logicalW);
			}
			return result;
		}

		function getWindowScrollTop() {
			var result = 0;
			if ('pageXOffset' in window) {
				result = window.pageYOffset;
			} else {
				result = document.documentElement.scrollTop / getZoomAmount();
			}
			return result;
		}

		function getWindowScrollLeft() {
			var result = 0;
			if ('pageXOffset' in window) {
				result =  window.pageXOffset;
			} else {
				result = document.documentElement.scrollLeft / getZoomAmount();
			}
			return result;
		}

		function getScrollTop(node) {
			return node.getBoundingClientRect().top;
		}

		function getScrollLeft(node) {
			return node.getBoundingClientRect().left;
		}

		function init() {
			constructNav();

			// Create event listens on the jumpnav
			for(var i = 0; i < nav.getElementsByTagName('a').length; i++) {
				listen(nav.getElementsByTagName('a')[i], 'click', function(e) {
					e.preventDefault();
					V(document.querySelector(e.target.hash), "scroll", {duration: options.speed, easing: "ease-in-out"});
				});
			}
		}

		init();

		// Returns the active hash node based on nodes scrollTop
		function getActiveHashNode(hashNodes) {
			var result = null;
			var max = -1;
			for(var i = 0; i < hashNodes.length; i++) {
				var elemY = getScrollTop(hashNodes[i]);
				if(elemY <= 0) {
					if(elemY > max || max === -1) {
						max = elemY;
						result = hashNodes[i];
					}
				}
			}
			return result;
		}

		listen(window, 'scroll', function(e) {
			var activeHashNode = getActiveHashNode(sections);
			window.location.hash = activeHashNode.id;
		});

		listen(window, 'resize', function(e) {
		});
	};

	window.FireNav = FireNav;

})(window, document);