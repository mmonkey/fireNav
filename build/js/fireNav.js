/* fireNav (0.2.0). (C) 2014 CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
var V = (window.jQuery) ? $.Velocity : Velocity;

(function (FireNav, window, undefined) {

	var fireNav = {
	};

	/**
	 * FireNav.jump function
	 * Adds a smart jump menu that appends to the body
	 */
	fireNav.jump = function(sel, opts) {

		// Log error if velocity is not found.
		if(typeof V === 'undefined') {
			console.log('%cWARNING: fireSlider requires velocity.js to run correctly.', 'background: #E82C0C; color: white; padding: 0 12px;');
			return;
		}

		var jumpNav = {
			activeHashNode: null,
			jumpLinks: [],
			nav: {},
			options: {},
			selector: "",
			sections: [],
			watchScroll: true
		};

		// Load selector and nav
		jumpNav.selector = sel;
		jumpNav.nav = document.querySelector(jumpNav.selector);
		if(typeof jumpNav.nav === 'undefined') return;
		
		var defaults = {
			activeClass: 'firenav-jump-active',
			offset: 0,
			section: ".firenav-section",
			speed: 800,
			updateHash: false,
			watchScroll: true
		};

		var data = fireNav._utilities.getData(jumpNav.nav);

		jumpNav.data = {
			firenavActiveClass: data.firenavActiveClass,
			offset: (data.firenavOffset) ? parseInt(data.firenavOffset) : undefined,
			section: data.firenavSection,
			speed: (data.firenavSpeed) ? parseInt(data.firenavSpeed) : undefined,
			updateHash: (data.firenavUpateHash) ? fireNav._utilities.getBoolean(data.firenavUpdateHash) : undefined,
			watchScroll: (data.firenavWatchScroll) ? fireNav._utilities.getBoolean(data.firenavWatchScroll) : undefined
		};

		// Removed undefined data
		fireNav._utilities.removeUndefined(jumpNav.data);

		// Extend options with defaults
		var options = fireNav._utilities.extend(jumpNav.data, opts);
		jumpNav.options = fireNav._utilities.extend(options, defaults);

		// Load sections
		jumpNav.sections = document.querySelectorAll(jumpNav.options.section);
		if(jumpNav.sections.length === 0) return;

		var isScrolling = false;

		function constructNav() {
			var ul = document.createElement('UL');

			for(var i = 0; i < jumpNav.sections.length; i++) {
				var li = document.createElement('LI');
				var a = document.createElement('A');
				var data = fireNav._utilities.getData(jumpNav.sections[i]);
				a.href = '#' + jumpNav.sections[i].id;
				a.innerText = (data.firenavJumpName) ? data.firenavJumpName : '';
				li.appendChild(a);
				ul.appendChild(li);
				jumpNav.jumpLinks.push(li);
			}

			jumpNav.nav.appendChild(ul);
		}

		// Returns the active hash node based on nodes scrollTop
		function getActiveHashNode(hashNodes) {
			var result = null;
			var max = -1;
			for(var i = 0; i < hashNodes.length; i++) {
				var elemY = fireNav._utilities.getScrollTop(hashNodes[i]);
				if(Math.floor(elemY) <= jumpNav.options.offset) {
					if(elemY > max || max === -1) {
						max = elemY;
						result = hashNodes[i];
					}
				}
			}
			return result;
		}

		// Adds class to active link, removes class from previous active link
		function updateActiveLinkClass(opts) {
			for(var i = 0; i < jumpNav.jumpLinks.length; i++) {
				var link = jumpNav.jumpLinks[i].getElementsByTagName('A')[0];

				if(opts.prevNode) {
					if(link.hash === '#' + opts.prevNode) {
						fireNav._utilities.removeClass(jumpNav.jumpLinks[i], opts.className);
					}
				}

				if(opts.nextNode) {
					if(link.hash === '#' + opts.nextNode) {
						fireNav._utilities.addClass(jumpNav.jumpLinks[i], opts.className);
					}
				}
			}
		}

		// Updates the active hash node based on nodes scrollTop
		function updateActiveHashNode() {
			if(jumpNav.activeHashNode !== getActiveHashNode(jumpNav.sections)) {
				var lastActiveHashNode = jumpNav.activeHashNode;
				jumpNav.activeHashNode = getActiveHashNode(jumpNav.sections);
				updateActiveLinkClass({
					prevNode: (lastActiveHashNode) ? lastActiveHashNode.id : null,
					nextNode: (jumpNav.activeHashNode) ? jumpNav.activeHashNode.id : null,
					className: jumpNav.options.activeClass
				});
			}
		}

		// Smooth scroll links on click events, add active class to clicked jump link
		function addJumpLinkClickEvent(node) {
			fireNav._utilities.listen(node, 'click', function(e) {
					if (e.preventDefault) e.preventDefault();
					else e.returnValue = false;
					var target = (e.target) ? e.target : e.srcElement;
					var section = document.querySelector(target.hash);
					isScrolling = true;
					V(section, "scroll", { duration: jumpNav.options.speed, easing: "ease-in-out", offset: jumpNav.options.offset,
						complete: function() {
							jumpNav.watchScroll = false;

							if(jumpNav.activeHashNode !== section) {
								var lastActiveHashNode = jumpNav.activeHashNode;
								jumpNav.activeHashNode = section;

								updateActiveLinkClass({
									prevNode: (lastActiveHashNode) ? lastActiveHashNode.id : null,
									nextNode: (jumpNav.activeHashNode) ? jumpNav.activeHashNode.id : null,
									className: jumpNav.options.activeClass
								});
							}

							// makes up for Velocities built in animation delay
							setTimeout(function() {
								if(jumpNav.options.updateHash) {
									if(history.replaceState) {
										history.replaceState(undefined, undefined, '#' + jumpNav.activeHashNode.id);
									} else if(window.location.replace) {
										window.location.replace('#' + jumpNav.activeHashNode.id);
									}
								}

								jumpNav.watchScroll = true;
							}, 20);

							isScrolling = false;

						}
					});
				
				});
		}

		// Add jumpNav listeners
		function addJumpNavEventListeners() {

			if(jumpNav.options.watchScroll) {
				fireNav._utilities.listen(window, 'scroll', function(e) {
					if(jumpNav.watchScroll) {
						updateActiveHashNode();
						if(jumpNav.options.updateHash && !isScrolling) {
							if(history.replaceState) {
								history.replaceState(undefined, undefined, '#' + jumpNav.activeHashNode.id);
							} else if(window.location.replace) {
								window.location.replace('#' + jumpNav.activeHashNode.id);
							}
						}
					}
				});
			}
		}

		function init() {
			constructNav();

			// Create event listeners on the jumpnav
			for(var i = 0; i < jumpNav.nav.getElementsByTagName('a').length; i++) {
				var link = jumpNav.nav.getElementsByTagName('a')[i];
				addJumpLinkClickEvent(link);
			}

			updateActiveHashNode();
			addJumpNavEventListeners();
		}

		init();
		return jumpNav;
	};

	/**
	 * FireNav.tab function
	 * Adds a tabbed menu
	 */
	fireNav.tabs = function(sel, opts) {

		var tabNav = {
			currentIndex: -1,
			data: {},
			nav: {},
			options: {},
			selector: '',
			tabLinks: [],
			tabs: []
		};

		// Load selector and nav
		tabNav.selector = sel;
		tabNav.nav = document.querySelector(tabNav.selector);
		if(typeof tabNav.nav === 'undefined') return;

		var defaults = {
			activeTabClass: 'firenav-tab-active',
			activeTabLinkClass: 'firenav-tab-link-active',
			loadHash: true,
			tab: '.tab'
		};

		var data = fireNav._utilities.getData(tabNav.nav);

		tabNav.data = {
			activeTabClass: data.firenavActiveTabClass,
			activeTabLinkClass: data.firenavActiveTabLinkClass,
			loadHash: (data.firenavLoadHash) ? fireNav._utilities.getBoolean(data.firenavLoadHash) : undefined,
			tab: data.firenavTab
		};

		fireNav._utilities.removeUndefined(tabNav.data);

		// Load options
		var options = fireNav._utilities.extend(tabNav.data, opts);
		tabNav.options = fireNav._utilities.extend(options, defaults);

		// Load tabs
		tabNav.tabs = document.querySelectorAll(tabNav.options.tab);
		if(tabNav.tabs.length === 0) return;

		function constructNav() {
			var ul = document.createElement('UL');
			
			for(var i = 0; i < tabNav.tabs.length; i++) {
				var li = document.createElement('LI');
				var a = document.createElement('A');
				var data = fireNav._utilities.getData(tabNav.tabs[i]);
				var title = (data.firenavTab) ? data.firenavTab : '';
				var clean = fireNav._utilities.cleanString(title);
				tabNav.tabs[i].id = clean;
				a.text = title;
				a.href = '#' + clean;
				li.appendChild(a);
				ul.appendChild(li);
				tabNav.tabLinks.push(li);
			}

			tabNav.nav.appendChild(ul);
		}

		function updateActiveTab(pos) {
			if(tabNav.currentIndex > -1) {
				tabNav.tabs[tabNav.currentIndex].style.display = 'none';
				fireNav._utilities.removeClass(tabNav.tabs[tabNav.currentIndex], tabNav.options.activeTabClass);
				fireNav._utilities.removeClass(tabNav.tabLinks[tabNav.currentIndex], tabNav.options.activeTabLinkClass);
			}
			tabNav.tabs[pos].style.display = 'block';
			fireNav._utilities.addClass(tabNav.tabs[pos], tabNav.options.activeTabClass);
			fireNav._utilities.addClass(tabNav.tabLinks[pos], tabNav.options.activeTabLinkClass);
			tabNav.currentIndex = pos;
		}

		function addTabLinkClickEvent(link) {
			fireNav._utilities.listen(link, 'click', function(e) {
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				updateActiveTab(fireNav._utilities.getNodeIndex(link.parentNode));
				if(tabNav.options.loadHash) {
					if(history.replaceState) {
						history.replaceState(undefined, undefined, link.hash);
					} else if(window.location.replace) {
						window.location.replace(link.hash);
					}
				}
			});
		}

		function getActiveHashIndex(hash) {
			for(var i = 0; i < tabNav.tabs.length; i++) {
				if(tabNav.tabs[i].id === hash.replace('#', '')) {
					return i;
				}
			}
			return -1;
		}

		function init() {
			constructNav();

			for(var i = 0; i < tabNav.nav.getElementsByTagName('a').length; i++) {
				var link = tabNav.nav.getElementsByTagName('a')[i];
				addTabLinkClickEvent(link);
			}

			// hide all tabs
			for(i = 0; i < tabNav.tabs.length; i++) {
				tabNav.tabs[i].style.display = 'none';
			}

			var activeIndex = getActiveHashIndex(window.location.hash);
			if(tabNav.options.loadHash && activeIndex > -1) {
				updateActiveTab(activeIndex);
			} else {
				updateActiveTab(0);
			}
		}

		init();
		return tabNav;
	};

	fireNav._utilities = {

		// Add class to node's classList
		addClass: function(node, newClass) {
			if (node.classList) {
					node.classList.add(newClass);
			} else {
					node.className += ' ' + newClass;
			}
		},

		// Remove class from node's classList
		removeClass: function(node, rmClass) {
			if (node.classList) {
					node.classList.remove(rmClass);
			} else {
				node.className = node.className.replace(new RegExp('(^|\\b)' + rmClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		},

		// Returns true if node has className
		hasClass: function(node, className) {
			return (node.classList) ? node.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(node.className);
		},

		getBoolean: function(string) {
			return (string.toLowerCase() === 'true');
		},

		// Returns the index of a node amongst that node's siblings
		getNodeIndex: function(node) {
			var index = 0;
			if(node !== null) {
				while ( (node = node.previousSibling) ) {
					if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
						index++;
					}
				}
				return index;
			} else {
				return -1;
			}
		},

		// Format data-attribute key
		formatDataKey: function(key) {
			var temp = [];
			key = key.replace('data-', '');
			key = key.split('-');
			temp[0] = key[0];
			for(var i = 1; i < key.length; i++) {
				temp.push(key[i].charAt(0).toUpperCase() + key[i].substr(1).toLowerCase());
			}
			return temp.join('');
		},

		// Shim for element.dataset
		getData: function(node){
			if(node.dataset) {
				return node.dataset;
			} else {
				var attributes = node.attributes;
				var simulatedDataset = {};
				for (var i = attributes.length; i--; ){
					if (/^data-.*/.test(attributes[i].name)) {
						var key = fireNav._utilities.formatDataKey(attributes[i].name);
						var value = node.getAttribute(attributes[i].name);
						simulatedDataset[key] = value;
					}
				}
				return simulatedDataset;
			}
		},

		// Extend defaults into opts, returns options - comment below prevents warning about hasOwnProperty in gulp
		/* jshint -W001 */
		extend: function(opts, def) {
			var options = opts || {};
			var defaults = def || {};
			for (var opt in defaults) {
				defaults.hasOwnProperty = defaults.hasOwnProperty || Object.prototype.hasOwnProperty;
				if (defaults.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
					options[opt] = defaults[opt];
				}
			}
			return options;
		},

		// Removes properties from object that are 'undefined'
		removeUndefined: function(object) {
			for(var key in object) {
				if(typeof object[key] === "undefined") delete object[key];
			}
		},

		// Clean String
		cleanString: function(string) {
			return string.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/&#{0,1}[a-z0-9]+;/ig, '').replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
		},

		// Custom events will bind to these htmlEvents in ie < 9
		htmlEvents: {
			onload: 1, onunload: 1, onblur: 1, onchange: 1, onfocus: 1, onreset: 1, onselect: 1,
			onsubmit: 1, onabort: 1, onkeydown: 1, onkeypress: 1, onkeyup: 1, onclick: 1, ondblclick: 1,
			onmousedown: 1, onmousemove: 1, onmouseout: 1, onmouseover: 1, onmouseup: 1
		},

		// Event listener for built-in and custom events
		listen: function(el, type, handler){
			if(el.listenListener){
				el.listenListener(type,handler,false);
			}else if(el.attachEvent && fireNav._utilities.htmlEvents['on'+type]){// IE < 9
				el.attachEvent('on'+type,handler);
			}else{
				el['on'+type]=handler;
			}
		},

		getZoomAmount: function() {
			var result = 1;
			if (document.body.getBoundingClientRect) {
				var rect = document.body.getBoundingClientRect();
				var physicalW = rect.right - rect.left;
				var logicalW = document.body.offsetWidth;
				result = (physicalW / logicalW);
			}
			return result;
		},

		getWindowScrollTop: function() {
			var result = 0;
			if ('pageXOffset' in window) {
				result = window.pageYOffset;
			} else {
				result = document.documentElement.scrollTop / fireNav._utilities.getZoomAmount();
			}
			return result;
		},

		getWindowScrollLeft: function() {
			var result = 0;
			if ('pageXOffset' in window) {
				result =  window.pageXOffset;
			} else {
				result = document.documentElement.scrollLeft / fireNav._utilities.getZoomAmount();
			}
			return result;
		},

		getScrollTop: function(node) {
			return node.getBoundingClientRect().top;
		},

		getScrollLeft: function(node) {
			return node.getBoundingClientRect().left;
		}
	};

	window.FireNav = fireNav;

})((window.FireNav = window.FireNav || {}), window);

// If jQuery is available, create .fireNavJump() function
if(window.jQuery) {
	(function (window) {
		$.fn.fireNavJump = function(opts) {
			// Call FireNav.jump() with selector and arguments
			var jumpNav = FireNav.jump(this.selector, opts);

			// Return jquery object
			return $(jumpNav);
		};

		$.fn.fireNavTabs = function(opts) {
			// Call FireNav.tabs() with selector and arguments
			var tabNav = FireNav.tabs(this.selector, opts);

			// Return jquery object
			return $(tabNav);
		};
	})(window.jQuery);
}