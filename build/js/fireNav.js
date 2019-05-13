'use strict';

(function ($, window, document, undefined) {
	const jumpDefaults = {
		jumpItemTemplate: '<li class="firenav-jump-section-item">{{ jump_link }}</li>',
		jumpLinkClass: 'firenav-jump-link',
		jumpSectionActiveClass: 'firenav-jump-active',
		jumpSectionTemplate: '<ul class="firenav-jump-section-{{ depth }}"></ul>',
		offset: 0,
		speed: 800,
		selector: '.firenav-section',
		updateHash: false,
		watchScroll: true
	};

	const tabDefaults = {
		activeTabClass: 'firenav-tab-active',
		activeTabLinkClass: 'firenav-tab-link-active',
		loadHash: true
	};

	function FireNavJump(el, options) {
		this.$el = $(el);
		this.options = options;
		this._attribures = utilities.getData(this.$el.data());
		this.options = $.extend({}, jumpDefaults, options, this._attribures);

		this.init();
	}

	function FireNavTabs(el, options) {
		this.$el = $(el);
		this.options = options;
		this._attribures = utilities.getData(this.$el.data());
		this.options = $.extend({}, tabDefaults, options, this._attribures);

		this.init();
	}

	FireNavJump.prototype = {

		init: function () {
			const nav = this;

			// Do not continue if velocity isn't loaded
			if ($.type($.Velocity) === 'undefined') {
				console.log('%cWARNING: fireSlider requires velocity.js to run correctly.',
					'background: #E82C0C; color: white; padding: 0 12px;');
				return false;
			}

			if (!nav.options.selector) return false;
			nav.options.sections = $(nav.options.selector);

			if (!nav.createSectionIds()) return false;

			nav.jumpLinks = $();
			nav.constructJumpNav();

			if (nav.options.updateHash) {
				nav.loadWindowHash();
			} else {
				nav.updateActiveSection();
			}

			nav.addJumpNavClickEvents();

			nav.initFunctions();
			nav.bindEvents();
		},

		createSectionIds() {
			const nav = this;

			nav.options.sections.each(function (i) {
				const data = $(this).data();
				const name = (data.firenavJumpName) ? data.firenavJumpName : '';
				let parent = $(this).parents(nav.options.selector).first();

				let id = utilities.cleanString(name);
				id = parent.length && parent[0] && parent[0].id ? parent[0].id + '-' + id : id;
				id = $(this)[0].id ? $(this)[0].id : id;
				$(this).attr('id', id);

				if ($(this)[0].id === '' && id === '') {
					console.log('%cWARNING: Neither "data-firenav-jump-name" or "id" was found on section ' + (i + 1) + '.',
						'background: #E82C0C; color: white; padding: 0px 12px;');
					return false;
				}
			});

			return true;
		},

		constructJumpNav() {
			const nav = this;
			const depth = 0;
			const list = nav.createNavListSection(0);

			nav.loadSections(depth, nav.options.sections, list, nav.options.selector);
			nav.$el.append(list);
		},

		createNavListSection: function (depth) {
			const nav = this;
			const markup = nav.parseJumpSectionTemplateTags(nav.options.jumpSectionTemplate, depth);
			return $(markup);
		},

		parseJumpSectionTemplateTags(template, depth) {
			let result = template;

			const depthTag = utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			return result;
		},

		loadSections(depth, sections, list, sel) {
			const nav = this;
			const section = nav.getSectionAtDepth(depth, sections, sel);
			if (section.length === 0) return;
			nav.processSection(depth, section, list, sel);
			depth++;
			nav.loadSections(depth, sections, list, sel);
		},

		getSectionAtDepth(depth, sections, sel) {
			let results = $();

			sections.each(function () {
				if ($(this).parents(sel).length === depth) {
					results = results.add($(this));
				}
			});
			return results;
		},

		processSection(depth, section, list, sel) {
			const nav = this;

			section.each(function () {
				const item = nav.createNavListItem($(this), depth);
				if ($(this).find(sel).length > 0) {
					item.append(nav.createNavListSection(depth));
				}

				const parent = $(this).parents(sel).first();
				if (parent.length > 0) {
					const link = '#' + parent[0].id;
					const target = list.find('a[href="' + link + '"]').parent();
					const targetUL = target.find('ul');
					targetUL.append(item);
				} else {
					list.append(item);
				}
			});
		},

		createNavListItem(el, depth) {
			const nav = this;
			const item = $(nav.parseJumpItemTemplateTags(el, nav.options.jumpItemTemplate, depth));
			nav.jumpLinks = nav.jumpLinks.add(item);

			return item;
		},

		parseJumpItemTemplateTags(el, template, depth) {
			const nav = this;
			const data = el.data();
			let result = template;

			const depthTag = utilities.getTemplateTagRegex('depth');
			if (result.search(depthTag) !== -1) {
				result = result.replace(depthTag, (depth + 1).toString());
			}

			const jumpLinkTag = utilities.getTemplateTagRegex('jump_link');
			if (result.search(jumpLinkTag) !== -1) {
				const href = '#' + el.get(0).id;
				const name = (data.firenavJumpName) ? data.firenavJumpName : el.get(0).id;
				const linkClass = nav.options.jumpLinkClass;
				const link = '<a href="' + href + '" class="' + linkClass + '">' + name + '</a>';
				result = result.replace(jumpLinkTag, link);
			}

			const jumpNameTag = utilities.getTemplateTagRegex('jump_name');
			if (result.search(jumpNameTag) !== -1) {
				const jumpName = (data.firenavJumpName) ? data.firenavJumpName : el.get(0).id;
				result = result.replace(jumpNameTag, jumpName);
			}

			return result;
		},

		loadWindowHash() {
			const nav = this;
			const hash = window.location.hash;

			nav.jumpLinks.each(function () {
				if ($(this).find('a').attr('href') === hash) {
					nav.activeSection = $(hash);
				}
			});

			nav.updateActiveLinkClass(undefined, nav.activeSection, nav.options.jumpSectionActiveClass);
		},

		updateActiveSection() {
			const nav = this;
			const active = nav.getActiveSection();
			if (!(nav.activeSection instanceof jQuery) || !nav.activeSection.is(active)) {
				const prev = (nav.activeSection) ? nav.activeSection : $();
				nav.activeSection = active;
				nav.updateActiveLinkClass(prev, active, nav.options.jumpSectionActiveClass);
			}
		},

		getActiveSection() {
			const nav = this;

			let max = -1;
			let result = $();
			nav.options.sections.each(function () {
				const elemY = $(this).get(0).getBoundingClientRect().top + nav.options.offset;
				if (Math.floor(elemY) <= 0) {
					if (elemY > max || max === -1) {
						max = elemY;
						result = $(this);
					}
				}
			});

			return result;
		},

		updateActiveLinkClass(prev, active, className) {
			const nav = this;

			nav.jumpLinks.each(function () {
				if (prev && $(this).find('a').attr('href') === '#' + prev.attr('id')) $(this).removeClass(className);
				if (active && $(this).find('a').attr('href') === '#' + active.attr('id')) $(this).addClass(className);
			});

			if (active && active.length > 0) {
				const data = active.data();
				const jumpClass = (data.firenavJumpClass) ? data.firenavJumpClass : '';

				if (nav.activeJumpClass !== '') {
					nav.$el.removeClass(nav.activeJumpClass);
				}

				if (jumpClass !== '') {
					nav.activeJumpClass = jumpClass;
					nav.$el.addClass(jumpClass);
				}
			}
		},

		addJumpNavClickEvents: function () {
			const nav = this;

			nav.jumpLinks.find('a').each(function () {
				$(this).click(function (e) {
					e.preventDefault();

					nav.options.sections.filter($(this).attr('href')).velocity("scroll", {
						duration: nav.options.speed, easing: "ease-in-out", offset: nav.options.offset, complete() {
							const prev = nav.activeSection;
							if (!$(this).is(prev)) {
								nav.activeSection = $(this);
								nav.updateActiveLinkClass(prev, $(this), nav.options.jumpSectionActiveClass);
							}
							nav.updatePageUrl('#' + $(this).attr('id'));
						}
					});
				});
			});
		},

		updatePageUrl(hash) {
			const nav = this;

			if (nav.options.updateHash) {
				if (history.replaceState) {
					history.replaceState(undefined, undefined, hash);
				} else if (window.location.replace) {
					window.location.replace(hash);
				}
			}
		},

		initFunctions() {
			const nav = this;

			nav.destroy = () => {
				nav.$el.trigger('fireNav:jump:destroy');
			};

			$(window).scroll(() => {
				nav.$el.trigger('fireNav:jump:scroll');
			});
		},

		bindEvents() {
			const nav = this;

			nav.$el.on('fireNav:jump:destroy', () => {
				nav.unbindEvents();
				nav.$el.empty();
			});

			nav.$el.on('fireNav:jump:scroll', () => {
				const current = nav.activeSection;
				nav.updateActiveSection();
				if (nav.activeSection !== current && nav.options.updateHash) {
					if (nav.activeSection.length > 0) {
						nav.updatePageUrl('#' + nav.activeSection.get(0).id);
					}
				}
			});
		},

		unbindEvents() {
			const nav = this;

			nav.$el.off('fireNav:jump:scroll');
		}
	};

	FireNavTabs.prototype = {

		init() {
			const nav = this;

			if (!(nav.options.tabs instanceof jQuery)) {
				nav.options.tabs = $('.tab');
			}

			this.constructTabNav();
			this.addListeners();

			// Hide all tabs
			this.options.tabs.css('display', 'none');

			// Show active tab
			const id = window.location.hash;
			const loadedLink = this.$el.find('a[href="' + id + '"]');
			const loadedTab = this.options.tabs.filter(id);

			this.activeLink = (this.options.loadHash && loadedLink.length) ? loadedLink : this.$el.find('a').first();
			this.activeTab = (this.options.loadHash && loadedTab.length) ? loadedTab : this.options.tabs.first();
			this.updateActiveTab(this.activeLink, this.activeTab);

			this.initFunctions();
			this.bindEvents();
		},

		constructTabNav() {
			const nav = this;
			const ul = $('<ul></ul>');

			nav.options.tabs.each(function () {
				const data = $(this).data();
				const linkText = (data.firenavTab) ? data.firenavTab : '';
				const id = utilities.cleanString(linkText);
				$(this).attr('id', id);
				ul.append('<li><a href="#' + id + '">' + linkText + '</a></li>');
			});

			nav.$el.append(ul);
		},

		addListeners() {
			const nav = this;

			nav.$el.find('a').each(function () {

				$(this).click(e => {
					e.preventDefault();
					const id = $(e.target).attr('href');

					nav.updateActiveTab($(e.target), nav.options.tabs.filter(id));
					if (nav.options.loadHash) {
						if (history.replaceState) {
							history.replaceState(undefined, undefined, id);
						} else if (window.location.replace) {
							window.location.replace(id);
						}
					}

				});

			});
		},

		updateActiveTab(link, tab) {
			const nav = this;

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
		},

		initFunctions() {
			const nav = this;

			nav.destroy = () => {
				nav.$el.trigger('fireNav:tabs:destroy');
			};
		},

		bindEvents() {
			const nav = this;

			nav.$el.on('fireNav:tabs:destroy', () => {
				nav.$el.empty();
			});
		}
	};

	const utilities = {

		// Returns lowercase, dash-separated string
		cleanString(string) {
			return string.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/&#{0,1}[a-z0-9]+;/ig, '').replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
		},

		// Converts removes firenav prefix from data stored on the slider object
		getData(data) {
			$.each(data, (key) => {
				$.each(['fireNav', 'firenav', 'fire-nav'], (i, match) => {
					if (key.toLowerCase().indexOf(match) > -1 && key !== 'fireNavJump' && key !== 'fireNavTabs') {
						let newKey = key.replace(new RegExp(match, 'gi'), '');
						newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
						data[newKey] = data[key];
						delete data[key];
					}
				});
			});
			return data;
		},

		// Create a regex string for parsing a template tag
		getTemplateTagRegex(tag) {
			return new RegExp('{{\\s*' + tag + '\\s*}}', 'g');
		}

	};

	$.fn.fireNavJump = function (options) {
		return this.each(function () {

			if ($.data(this, 'fireNavJump')) {
				$(this).data('fireNavJump').destroy();
				$(this).removeData('fireNavJump');
			}

			$.data(this, 'fireNavJump', new FireNavJump(this, options));
		});
	};

	$.fn.fireNavTabs = function (options) {
		return this.each(function () {

			if ($.data(this, 'fireNavTabs')) {
				$(this).data('fireNavTabs').destroy();
				$(this).removeData('fireNavTabs');
			}

			$.data(this, 'fireNavTabs', new FireNavTabs(this, options));
		});
	};

	window.fireNavJump = FireNavJump;
	window.fireNavTabs = FireNavTabs;

})(jQuery, window, document);