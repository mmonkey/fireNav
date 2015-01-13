/* fireNav (0.1.0). (C) 2014 CJ O'Hara and Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
var Velocity = require('velocity-animate');

(function () {

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

	// Custom events will bind to these htmlEvents in IE < 9
	var htmlEvents = {
		onload: 1, onunload: 1, onblur: 1, onchange: 1, onfocus: 1, onreset: 1, onselect: 1,
		onsubmit: 1, onabort: 1, onkeydown: 1, onkeypress: 1, onkeyup: 1, onclick: 1, ondblclick: 1,
		onmousedown: 1, onmousemove: 1, onmouseout: 1, onmouseover: 1, onmouseup: 1
	};

	// Create and trigger an event
	function trigger(el, eventName){
		var event;
		if(document.createEvent){
			event = document.createEvent('HTMLEvents');
			event.initEvent(eventName,true,true);
		}else if(document.createEventObject){// IE < 9
			event = document.createEventObject();
			event.eventType = eventName;
		}
		event.eventName = eventName;
		if(el.dispatchEvent){
			el.dispatchEvent(event);
		}else if(el.fireEvent && htmlEvents['on'+eventName]){// IE < 9
			el.fireEvent('on'+event.eventType,event); // can trigger only real event (e.g. 'click')
		}else if(el[eventName]){
			el[eventName]();
		}else if(el['on'+eventName]){
			el['on'+eventName]();
		}
	}

	// Event listener for built-in and custom events
	function listen(el, type, handler){
		if(el.listenListener){
			el.listenListener(type,handler,false);
		}else if(el.attachEvent && htmlEvents['on'+type]){// IE < 9
			el.attachEvent('on'+type,handler);
		}else{
			el['on'+type]=handler;
		}
	}

	// Remove event listener for built-in and custom events
	function removeEvent(el, type, handler){
		if(el.removeventListener){
			el.removeEventListener(type,handler,false);
		}else if(el.detachEvent && htmlEvents['on'+type]){// IE < 9
			el.detachEvent('on'+type,handler);
		}else{
			el['on'+type]=null;
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
					if (e.preventDefault) e.preventDefault();
					else e.returnValue = false;
					var target = (e.target) ? e.target : e.srcElement;
					var section = document.querySelector(target.hash);
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
		};

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

})();