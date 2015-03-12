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
			console.log('%cWARNING: fireNav requires velocity.js to run correctly.', 'background: #E82C0C; color: white; padding: 0 12px;');
			return;
		}

		var isScrolling = false;

		var jumpNav = {
			activeHashNode: null,
			activeJumpClass: '',
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
			jumpItemTemplate: '<li class="firenav-jump-section-item">{{ jump_link }}</li>',
			jumpLinkClass: 'firenav-jump-link',
			jumpSectionActiveClass: 'firenav-jump-active',
			jumpSectionTemplate: '<ul class="firenav-jump-section-{{ depth }}"></ul>',
			offset: 0,
			section: ".firenav-section",
			speed: 800,
			updateHash: false,
			watchScroll: true
		};

		var data = fireNav._utilities.getData(jumpNav.nav);

		jumpNav.data = {
			jumpItemTemplate: data.firenavJumpItemTemplate,
			jumpLinkClass: data.firenavJumpLinkClass,
			jumpSectionActiveClass: data.firenavJumpSectionActiveClass,
			jumpSectionTemplate: data.firenavJumpSectionTemplate,
			offset: (data.firenavOffset) ? parseInt(data.firenavOffset) : undefined,
			section: data.firenavSection,
			speed: (data.firenavSpeed) ? parseInt(data.firenavSpeed) : undefined,
			updateHash: (data.firenavUpdateHash) ? fireNav._utilities.getBoolean(data.firenavUpdateHash) : undefined,
			watchScroll: (data.firenavWatchScroll) ? fireNav._utilities.getBoolean(data.firenavWatchScroll) : undefined
		};

		// Removed undefined data
		fireNav._utilities.removeUndefined(jumpNav.data);

		// Extend options with defaults
		var options = fireNav._utilities.extend(jumpNav.data, opts);
		jumpNav.options = fireNav._utilities.extend(options, defaults);


		jumpNav.sections = document.querySelectorAll(jumpNav.options.section);
		if(jumpNav.sections.length === 0) return;

		// Ensures that every section has an id
		function createSectionIds() {
			for(var i = 0; i < jumpNav.sections.length; i++) {
				var data = fireNav._utilities.getData(jumpNav.sections[i]);
				var name = (data.firenavJumpName) ? data.firenavJumpName : '';
				var nameId = fireNav._utilities.cleanString(name);

				var parents = fireNav._utilities.getMathingParents(jumpNav.sections[i], jumpNav.options.section);
				var parent = (parents.length > 0) ? parents.shift() : undefined;

				if(typeof parent !== 'undefined') nameId = parent.id + '-' + nameId;

				jumpNav.sections[i].id = (jumpNav.sections[i].id !== '') ? jumpNav.sections[i].id : nameId;
				if(jumpNav.sections[i].id === '' && nameId === '') {
					console.log('%cWARNING: Neither "data-firenav-jump-name" or "id" was found on section ' + (i + 1) + '.', 'background: #E82C0C; color: white; padding: 0px 12px;');
					return false;
				}
			}
			return true;
		}

		// Parse tags from jump section template
		function parseJumpSectionTemplateTags(template, depth) {
			var result = template;

			var depthTag = fireNav._utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			return result;
		}

		// Parse tags from jump item template
		function parseJumpItemTemplateTags(elm, template, depth) {
			var result = template;
			var data = fireNav._utilities.getData(elm);

			var depthTag = fireNav._utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			var jumpLinkTag = fireNav._utilities.getTemplateTagRegex('jump_link');
			if (result.search(jumpLinkTag) !== -1) {
				var href = '#' + elm.id;
				var name = (data.firenavJumpName) ? data.firenavJumpName : elm.id;
				var linkClass = jumpNav.options.jumpLinkClass;
				var link = '<a href="' + href + '" class="' + linkClass + '">' + name + '</a>';
				result = result.replace(jumpLinkTag, link);
			}

			var jumpNameTag = fireNav._utilities.getTemplateTagRegex('jump_name');
			if (result.search(jumpNameTag) !== -1) {
				var jumpName = (data.firenavJumpName) ? data.firenavJumpName : elm.id;
				result = result.replace(jumpNameTag, jumpName);
			}

			return result;
		}

		// Retuns a new dom element for a jumpNav list item
		function createNavListSection(depth) {
			var template = jumpNav.options.jumpSectionTemplate;
			var markup = parseJumpSectionTemplateTags(template, depth);
			var section = fireNav._utilities.createDomElementFromString(markup);
			return section;
		}

		// Returns a new dom element for a jumpNav list section
		function createNavListItem(elm, depth) {
			var data = fireNav._utilities.getData(elm);
			var template = jumpNav.options.jumpItemTemplate;
			var markup = parseJumpItemTemplateTags(elm, template, depth);
			var item = fireNav._utilities.createDomElementFromString(markup);
			jumpNav.jumpLinks.push(item);
			return item;
		}

		// Returns all sections at a given depth that match the selector
		function getSectionsAtDepth(array, sel, depth) {
			var result = [];
			for(var i = 0; i < array.length; i++) {
				if(fireNav._utilities.getMathingParents(array[i], sel).length === depth) {
					result.push(array[i]);
				}
			}
			return result;
		}

		// Create jumpNav link elements based on sections
		function processSection(array, sel, list, depth) {
			for(var i = 0; i < array.length; i++) {
				var item = createNavListItem(array[i], depth);

				var children = array[i].querySelectorAll(sel);
				if(children.length > 0) {
					var section = createNavListSection(depth);
					item.appendChild(section);
				}

				var parents = fireNav._utilities.getMathingParents(array[i], sel);
				var parent = (parents.length > 0) ? parents.shift() : undefined;
				insertElement(parent, item, list);
			}
		}

		// Inserts a jumpNav list item within it's parent
		function insertElement(parent, elm, list) {
			if(typeof parent !== 'undefined') {
				var link = '#' + parent.id;
				var target = list.querySelector('a[href="' + link + '"]').parentElement;
				var targetUL = target.querySelector('UL');
				targetUL.appendChild(elm);
			} else {
				list.appendChild(elm);
			}
		}

		// Recursive jumpNav section builder
		function loadSections(depth, array, list, sel) {
			var section = getSectionsAtDepth(array, sel, depth);
			if(section.length === 0) return;
			processSection(section, sel, list, depth);
			depth++;
			loadSections(depth, array, list, sel);
		}

		// Construct jumpNav navigation
		function constructNav() {
			var depth = 0;
			var array = jumpNav.sections;
			var list = createNavListSection(0);
			var sel = jumpNav.options.section;

			loadSections(depth, array, list, sel);
			jumpNav.nav.appendChild(list);
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
				var item = jumpNav.jumpLinks[i];
				var link = item.querySelector('a');

				if(opts.prevNode) {
					if(link.hash === '#' + opts.prevNode) fireNav._utilities.removeClass(item, opts.className);
				}

				if(opts.nextNode) {
					if(link.hash === '#' + opts.nextNode) fireNav._utilities.addClass(item, opts.className);
				}
			}

			var elm = document.getElementById(opts.nextNode);
			if(elm)  {
				var data = fireNav._utilities.getData(elm);
				var jumpClass = (data.firenavJumpClass) ? data.firenavJumpClass : '';
				if(jumpNav.activeJumpClass !== '') fireNav._utilities.removeClass(jumpNav.nav, jumpNav.activeJumpClass);
				if(jumpClass !== '') {
					jumpNav.activeJumpClass = jumpClass;
					fireNav._utilities.addClass(jumpNav.nav, jumpClass);
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
					className: jumpNav.options.jumpSectionActiveClass
				});
			}
		}

		// When page loads, update active hash from window.location.hash
		function loadWindowHash() {
			var hash = window.location.hash;
			var id = hash.split('#')[1];
			var elm = document.getElementById(id);

			for(var i = 0; i < jumpNav.jumpLinks.length; i++) {
				var item = jumpNav.jumpLinks[i];
				var link = item.querySelector('a');
				if(link.hash === hash) {
					fireNav._utilities.addClass(item, jumpNav.options.jumpSectionActiveClass);
					jumpNav.activeHashNode = elm;
				}
			}

			if(elm)  {
				var data = fireNav._utilities.getData(elm);
				var jumpClass = (data.firenavJumpClass) ? data.firenavJumpClass : '';
				if(jumpNav.activeJumpClass !== '') fireNav._utilities.removeClass(jumpNav.nav, jumpNav.activeJumpClass);
				if(jumpClass !== '') {
					jumpNav.activeJumpClass = jumpClass;
					fireNav._utilities.addClass(jumpNav.nav, jumpClass);
				}
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
									className: jumpNav.options.jumpSectionActiveClass
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

		// Create event listeners on the jumpnav links
		function addJumpNavClickEvents() {
			for(var i = 0; i < jumpNav.jumpLinks.length; i++) {
				var link = jumpNav.jumpLinks[i].querySelector('a');
				addJumpLinkClickEvent(link);
			}
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

		// Initialize jumpNav
		function init() {

			if(!createSectionIds()) return;
			constructNav();

			if(jumpNav.options.updateHash) {
				loadWindowHash();

				// Add event listeners after timeout so loadWindowHash() wont get overridden.
				setTimeout(function() {
					addJumpNavClickEvents();
					addJumpNavEventListeners();
				}, 5);
			} else {
				updateActiveHashNode();
				addJumpNavClickEvents();
				addJumpNavEventListeners();
			}

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

		// Clean String
		cleanString: function(string) {
			return string.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/&#{0,1}[a-z0-9]+;/ig, '').replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
		},

		// Create a dom element from HTML markup
		createDomElementFromString: function(markup) {
			var d = document.createElement('div');
			d.innerHTML = markup;
			return d.firstChild;
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

		// Parses boolean from string
		getBoolean: function(string) {
			return (string.toLowerCase() === 'true');
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

		// Returns an array of parent elements that match selector
		getMathingParents: function(elm, sel) {
			var matches = [];
			elm = (typeof elm.parentNode !== 'undefined') ? elm.parentNode : elm;
			while(elm) {
				if(fireNav._utilities.matchesSelector(elm, sel)) matches.push(elm);
				elm = elm.parentNode;
			}
			return matches;
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

		// Returns left scroll amount of node
		getScrollLeft: function(node) {
			return node.getBoundingClientRect().left;
		},

		// Returns top scroll amount of node
		getScrollTop: function(node) {
			return node.getBoundingClientRect().top;
		},

		// Create a regex string for parsing a template tag
		getTemplateTagRegex: function(tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		},

		// Returns left scroll amount of window 
		getWindowScrollLeft: function() {
			var result = 0;
			if ('pageXOffset' in window) {
				result =  window.pageXOffset;
			} else {
				result = document.documentElement.scrollLeft / fireNav._utilities.getZoomAmount();
			}
			return result;
		},

		// Returns top scroll amount of window
		getWindowScrollTop: function() {
			var result = 0;
			if ('pageXOffset' in window) {
				result = window.pageYOffset;
			} else {
				result = document.documentElement.scrollTop / fireNav._utilities.getZoomAmount();
			}
			return result;
		},

		// Returns the zoom amount
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

		// Returns true if node has className
		hasClass: function(node, className) {
			return (node.classList) ? node.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(node.className);
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

		// Returns true if element matches selector
		matchesSelector: function(elm, sel) {
			var all = document.querySelectorAll(sel);
			for (var i = 0; i < all.length; i++) {
				if (all[i] === elm) {
					return true;
				}
			}
			return false;
		},

		// Parses Json object from string
		parseJson: function(string) {
			var result;
			try {
				result = JSON.parse(string);
			}
			catch (e) {
				result = string;
			}
			return result;
		},
		
		// Remove class from node's classList
		removeClass: function(node, rmClass) {
			if (node.classList) {
					node.classList.remove(rmClass);
			} else {
				node.className = node.className.replace(new RegExp('(^|\\b)' + rmClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		},

		// Removes properties from object that are 'undefined'
		removeUndefined: function(object) {
			for(var key in object) {
				if(typeof object[key] === "undefined") delete object[key];
			}
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