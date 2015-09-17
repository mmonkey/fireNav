/*! fireNav (0.3.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
;(function ($, window, document, undefined) {
	var fireNavJump = "fireNavJump";
	var fireNavTabs = "fireNavTabs";

	var jumpDefaults = {
		jumpItemTemplate: '<li class="firenav-jump-section-item">{{ jump_link }}</li>',
		jumpLinkClass: 'firenav-jump-link',
		jumpSectionActiveClass: 'firenav-jump-active',
		jumpSectionTemplate: '<ul class="firenav-jump-section-{{ depth }}"></ul>',
		offset: 0,
		speed: 800,
		updateHash: false,
		watchScroll: true
	};

	var tabDefaults = {
		activeTabClass: 'firenav-tab-active',
		activeTabLinkClass: 'firenav-tab-link-active',
		loadHash: true
	};

	function FireNavJump (el, options, sel) {
		this.$el = $(el);
		this.selector = sel;
		this.options = options;
		this._name = fireNavJump;
		this._defaults = jumpDefaults;
		this._attribures = utilities.getData(this.$el.data());
		this.options = $.extend({}, jumpDefaults, options, this._attribures);

		this.init();
	}

	function FireNavTabs (el, options, sel) {
		this.$el = $(el);
		this.selector = sel;
		this.options = options;
		this._name = fireNavTabs;
		this._defaults = tabDefaults;
		this._attribures = utilities.getData(this.$el.data());
		this.options = $.extend({}, tabDefaults, options, this._attribures);

		this.init();
	}

	FireNavJump.prototype = {

		init: function () {
			var nav = this;

			// Do not continue if velocity isn't loaded
			if ($.type($.Velocity) === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.',
					'background: #E82C0C; color: white; padding: 0 12px;');
				return false;
			}

			if (!(nav.options.sections instanceof jQuery)) {
				nav.options.sections = $('.firenav-section');
			}

			if (!nav.createSectionIds()) return false;

			nav.jumpLinks = $();
			nav.constructJumpNav();

			if(nav.options.updateHash) {
			 	nav.loadWindowHash();
			} else {
				nav.updateActiveSection();
			}

			nav.addJumpNavClickEvents();
			// nav.addJumpNavEventListeners();
		},

		createSectionIds: function() {
			var nav = this;

			nav.options.sections.each(function (i) {
				var data = $(this).data();
				var name = (data.firenavJumpName) ? data.firenavJumpName : '';
				var parent = $(this).parents(nav.options.sections.selector).first();

				var id = utilities.cleanString(name);
				id = (parent.length) ? parent.get(0).id + '-' + id : id;
				id = ($(this).get(0).id) ? $(this).get(0).id : id;
				$(this).attr('id', id);

				if ($(this).get(0).id === '' && id === '') {
					console.log('%cWARNING: Neither "data-firenav-jump-name" or "id" was found on section ' + (i + 1) + '.',
						'background: #E82C0C; color: white; padding: 0px 12px;');
					return false;
				}
			});

			return true;
		},

		constructJumpNav: function () {
			var nav = this;
			var depth = 0;
			var sections = nav.options.sections;
			var list = nav.createNavListSection(0);
			var sel = nav.options.sections.selector;

			nav.loadSections(depth, sections, list, sel);
			nav.$el.append(list);
		},

		createNavListSection: function (depth) {
			var nav = this;
			var markup = nav.parseJumpSectionTemplateTags(nav.options.jumpSectionTemplate, depth);
			return $(markup);
		},

		parseJumpSectionTemplateTags: function (template, depth) {
			var nav = this;
			var result = template;

			var depthTag = utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			return result;
		},

		loadSections: function (depth, sections, list, sel) {
			var nav = this;
			var section = nav.getSectionAtDepth(depth, sections, sel);
			if (section.length === 0) return;
			nav.processSection(depth, section, list, sel);
			depth++;
			nav.loadSections(depth, sections, list, sel);
		},

		getSectionAtDepth: function (depth, sections, sel) {
			var nav = this;
			var results = $();
			sections.each(function () {
				if ($(this).parents(sel).length === depth) {
					results = results.add($(this));
				}
			});

			return results;
		},

		processSection: function (depth, section, list, sel) {
			var nav = this;
			section.each(function () {
				var item = nav.createNavListItem($(this), depth);
				if ($(this).find(sel).length > 0) {
					var section = nav.createNavListSection(depth);
					item.append(section);
				}

				var parent = $(this).parents(sel).first();
				if (parent.length > 0) {
					var link = '#' + parent.get(0).id;
					var target = list.find('a[href="' + link + '"]').parent();
					var targetUL = target.find('ul');
					targetUL.append(item);
				} else {
					list.append(item);
				}
			});
		},

		createNavListItem: function (el, depth) {
			var nav = this;
			var data = el.data();
			var markup = nav.parseJumpItemTemplateTags(el, nav.options.jumpItemTemplate, depth);
			var item = $(markup);
			nav.jumpLinks = nav.jumpLinks.add(item);
			return item;
		},

		parseJumpItemTemplateTags: function (el, template, depth) {
			var nav = this;
			var result = template;
			var data = el.data();

			var depthTag = utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			var jumpLinkTag = utilities.getTemplateTagRegex('jump_link');
			if (result.search(jumpLinkTag) !== -1) {
				var href = '#' + el.get(0).id;
				var name = (data.firenavJumpName) ? data.firenavJumpName : el.get(0).id;
				var linkClass = nav.options.jumpLinkClass;
				var link = '<a href="' + href + '" class="' + linkClass + '">' + name + '</a>';
				result = result.replace(jumpLinkTag, link);
			}

			var jumpNameTag = utilities.getTemplateTagRegex('jump_name');
			if (result.search(jumpNameTag) !== -1) {
				var jumpName = (data.firenavJumpName) ? data.firenavJumpName : el.get(0).id;
				result = result.replace(jumpNameTag, jumpName);
			}

			return result;
		},

		loadWindowHash: function () {
			var nav = this;
			var hash = window.location.hash;

			nav.jumpLinks.each(function () {
				if ($(this).find('a').attr('href') === hash) {
					nav.activeSection = $(hash);
				}
			});

			nav.updateActiveLinkClass(undefined, nav.activeSection, nav.options.jumpSectionActiveClass);
		},

		updateActiveSection: function () {
			var nav = this;
			var active = nav.getActiveSection();
			if (nav.activeSection !== active) {
				var prev = (nav.activeSection) ? nav.activeSection : $();
				nav.activeSection = active;
				nav.updateActiveLinkClass(prev, active, nav.options.jumpSectionActiveClass);
			}
		},

		updateActiveLinkClass: function (prev, active, className) {
			var nav = this;

			nav.jumpLinks.each(function () {
				if (prev && $(this).find('a').attr('href') === '#' + prev.attr('id')) $(this).removeClass(className);
				if ($(this).find('a').attr('href') === '#' + active.attr('id')) $(this).addClass(className);
			});

			if (active.length > 0) {
				var data = active.data();
				var jumpClass = (data.firenavJumpClass) ? data.firenavJumpClass : '';
				
				if (nav.activeJumpClass !== '') {
					nav.$el.removeClass(nav.activeJumpClass);
				}

				if (jumpClass !== '') {
					nav.activeJumpClass = jumpClass;
					nav.$el.addClass(jumpClass);
				}
			}
		},

		getActiveSection: function () {
			var nav = this;
			var result = $();
			var max = -1;
			nav.options.sections.each(function () {
				var elemY = $(this).scrollTop();
				if (Math.floor(elemY) <= nav.options.offset) {
					if (elemY > max || max === -1) {
						max = elemY;
						result = $(this);
					}
				}
			});

			return result;
		},

		addJumpNavClickEvents: function() {
			var nav = this;
			nav.jumpLinks.find('a').each(function () {
				$(this).click(function (e) {
					e.preventDefault();
					var id = $(this).attr('href');
					var section = nav.options.sections.filter($(this).attr('href')).velocity("scroll", {duration: nav.options.speed, easing: "ease-in-out", offset: nav.options.offset});
					var prev = nav.activeSection;
					if (section !== prev) {
						nav.activeSection = section;
						nav.updateActiveLinkClass(prev, section, nav.options.jumpSectionActiveClass);
					}
				});
			});
		}



	};

	FireNavTabs.prototype = {

		init: function () {
			var nav = this;

			if (!(nav.options.tabs instanceof jQuery)) {
				nav.options.tabs = $('.tab');
			}

			this.constructTabNav();
			this.addListeners();

			// Hide all tabs
			this.options.tabs.css('display', 'none');
			
			// Show active tab
			var id = window.location.hash;
			var loadedLink = this.$el.find('a[href="' + id + '"]');
			var loadedTab = this.options.tabs.filter(id);

			this.activeLink = (this.options.loadHash && loadedLink.length) ? loadedLink : this.$el.find('a').first();
			this.activeTab = (this.options.loadHash && loadedTab.length) ? loadedTab : this.options.tabs.first();
			this.updateActiveTab(this.activeLink, this.activeTab);
		},

		constructTabNav: function () {
			var nav = this;

			var ul = $('<ul></ul>');

			nav.options.tabs.each(function () {
				var data = $(this).data();
				var linkText = (data.firenavTab) ? data.firenavTab : '';
				var id = utilities.cleanString(linkText);
				$(this).attr('id', id);
				ul.append('<li><a href="#' + id + '">' + linkText + '</a></li>');
			});

			nav.$el.append(ul);
		},

		addListeners: function () {
			var nav = this;

			nav.$el.find('a').each(function () {
				
				$(this).click(function (e) {
					e.preventDefault();
					var id = $(this).attr('href');
					
					nav.updateActiveTab($(this), nav.options.tabs.filter(id));
					if(nav.options.loadHash) {
						if(history.replaceState) {
							history.replaceState(undefined, undefined, id);
						} else if(window.location.replace) {
							window.location.replace(id);
						}
					}

				});

			});
		},

		updateActiveTab: function (link, tab) {
			var nav = this;

			if (nav.activeLink && nav.activeLink instanceof jQuery) {
				nav.activeLink.parent('li').removeClass(nav.options.activeTabLinkClass);
			}

			if (nav.activeTab && nav.activeTab instanceof jQuery) {
				nav.activeTab.css('display', 'none').removeClass(nav.options.activeTabClass);
			}

			tab.css('display', 'block').addClass(nav.options.activeTabClass);
			link.parent('li').addClass(nav.options.activeTabLinkClass);
			nav.activeLink = link;
			nav.activeTab = tab;
		}

	};

	var utilities = {

		// Returns lowercase, dash-separated string
		cleanString: function(string) {
			return string.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/&#{0,1}[a-z0-9]+;/ig, '').replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
		},

		// Converts removes firenav prefix from data stored on the slider object
		getData: function (data) {
			$.each(data, function(key, value) {
				$.each(["firenav", "fire-nav"], function (i, match) {
					if (key.toLowerCase().indexOf(match) > -1 && key !== fireNavJump && key !== fireNavTabs) {
						var newKey = key.replace(new RegExp(match, 'gi'), '');
						newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
						data[newKey] = data[key];
						delete data[key];
					}
				});
			});
			return data;
		},

		// Create a regex string for parsing a template tag
		getTemplateTagRegex: function(tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		}

	};

	$.fn[fireNavJump] = function (options) {
		var sel = this.selector;
		return this.each(function () {

			if ($.data(this, fireNavJump)) {
				$(this).data(fireNavJump).destroy();
				$(this).removeData(fireNav);
			}
			
			$.data(this, fireNavJump, new FireNavJump(this, options, sel));
		});
	};

	$.fn[fireNavTabs] = function (options) {
		var sel = this.selector;
		return this.each(function () {

			if ($.data(this, fireNavTabs)) {
				$(this).data(fireNavTabs).destroy();
				$(this).removeData(fireNavTabs);
			}

			$.data(this, fireNavTabs, new FireNavTabs(this, options, sel));
		});
	};

	window.fireNavJump = FireNavJump;
	window.fireNavTabs = FireNavTabs;

})(jQuery, window, document);