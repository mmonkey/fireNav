/*! fireNav (0.3.0) (C) CJ O'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */
;(function ($, window, document, undefined) {
	var fireNavJump = "fireNavJump";
	var fireNavTabs = "fireNavTabs";
	var jumpDefaults = {

	};

	var tabDefaults = {
		activeTabClass: 'firenav-tab-active',
		activeTabLinkClass: 'firenav-tab-link-active',
		loadHash: true,
		tab: {}
	};

	function FireNavJump (el, options, sel) {
		this.$el = $(el);
		this.selector = sel;
		this.options = options;
		this._name = fireNavJump;
		this._defaults = jumpDefaults;
		this._attribures = this.getData(this.$el.data());
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
		}

	};

	FireNavTabs.prototype = {

		init: function () {
			var nav = this;

			if (!(nav.options.tabs instanceof jQuery)) return false;

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