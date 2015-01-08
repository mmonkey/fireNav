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
		} else if (elem.attachEvent) {
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
			appendTo: 'body',
			sectionClass: ".section",
			position: "right",
			speed: 800,
			offset: 0
		};

		var options = extend(opts, defaults);
		var sections = document.querySelectorAll(options.sectionClass);
		var nav = {};
		var jumpLinks = [];
		var activeHashNode = null;
		var watchScroll = true;

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
					jumpLinks.push(li);
					nav.appendChild(li);
				}
			}
			if(document.contains(document.querySelector(options.appendTo))) {
				document.querySelector(options.appendTo).appendChild(nav);
			} else {
				document.body.appendChild(nav);
			}
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

		// Returns the active hash node based on nodes scrollTop
		function getActiveHashNode(hashNodes) {
			var result = null;
			var max = -1;
			for(var i = 0; i < hashNodes.length; i++) {
				var elemY = getScrollTop(hashNodes[i]);
				if(elemY <= options.offset) {
					if(elemY > max || max === -1) {
						max = elemY;
						result = hashNodes[i];
					}
				}
			}
			return result;
		}

		// Updates the active hash node based on nodes scrollTop
		function updateActiveHashNode() {
			if(activeHashNode !== getActiveHashNode(sections)) {
				var lastActiveHashNode = activeHashNode;
				activeHashNode = getActiveHashNode(sections);
				updateActiveLinkClass({
					prevNode: (lastActiveHashNode) ? lastActiveHashNode.id : null,
					nextNode: (activeHashNode) ? activeHashNode.id : null,
					className: 'jump-nav-active'
				});
			}
		}

		// Adds class to active link, removes class from previous active link
		function updateActiveLinkClass(opts) {
			for(var i = 0; i < jumpLinks.length; i++) {
				var link = jumpLinks[i].getElementsByTagName('A')[0];

				if(opts.prevNode) {
					if(link.hash === '#' + opts.prevNode) {
						removeClass(jumpLinks[i], opts.className);
					}
				}

				if(opts.nextNode) {
					if(link.hash === '#' + opts.nextNode) {
						addClass(jumpLinks[i], opts.className);
					}
				}
			}
		}

		// Smooth scroll links on click events, add active class to clicked jump link
		function addJumpLinkClickEvent(node) {
			listen(node, 'click', function(e) {
					e.preventDefault();
					var section = document.querySelector(e.target.hash);
					V(section, "scroll", { duration: options.speed, easing: "ease-in-out", offset: options.offset,
						complete: function() {
							watchScroll = false;

							if(activeHashNode !== section) {
								var lastActiveHashNode = activeHashNode;
								activeHashNode = section;

								updateActiveLinkClass({
									prevNode: (lastActiveHashNode) ? lastActiveHashNode.id : null,
									nextNode: (activeHashNode) ? activeHashNode.id : null,
									className: 'jump-nav-active'
								});
							}

							// makes up for Velocities built in animation delay
							setTimeout(function() {
								watchScroll = true;
							}, 20);

						}
					});
				
				});
		}

		this.init = function() {
			constructNav();

			// Create event listeners on the jumpnav
			for(var i = 0; i < nav.getElementsByTagName('a').length; i++) {
				var link = nav.getElementsByTagName('a')[i];
				addJumpLinkClickEvent(link);
			}
			updateActiveHashNode();
		}

		listen(window, 'scroll', function(e) {
			if(watchScroll) {
				updateActiveHashNode();
				//window.location.hash = activeHashNode.id;
			}
		});

		listen(window, 'resize', function(e) {
		});
	};

	window.FireNav = FireNav;

})(window, document);