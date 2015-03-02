'use strict';

window.Profile = {
	pages: {
		'profile': {
			in: 'slideLeftIn',
			out: 'hide'
		},
		'projects': {
			in: 'slideLeftIn',
			out: 'hide'
		},
		'desc': {
			in: 'fadeIn',
			out: 'hide'
		},
		'mobile-header': {
			in: 'header-mobile-show',
			out: 'header-mobile-hide'
		}
	},
	init: function () {
		this.setListeners();
	},
	setListeners: function() {
		$('#nav-brand').on('click', $.proxy(this.showHomePage, this));
		$('#nav-profile').on('click', $.proxy(this.showProfilePage, this));
		$('#learn-more').on('click', $.proxy(this.showProfilePage, this));
		$('#nav-projects').on('click', $.proxy(this.showProjectsPage, this));
		$('#mobile-nav-mask').on('click', $.proxy(this.hideMobileMenu, this));
		$('.mobile-hamburger').on('click', $.proxy(this.showMobileMenu, this));
	},
	togglePages: function(finalPage) {
		var args = Array.prototype.slice.call(arguments);
		for(var page in this.pages) {
			var $page = $('#'+page);
			if(args.indexOf(page) !== -1) {
				$page.removeClass(this.pages[page].out);
				$page.addClass(this.pages[page].in);
			} else {
				if($page.hasClass(this.pages[page].in)) {
					$page.removeClass(this.pages[page].in);
					$page.addClass(this.pages[page].out);
				}
			}
		}
	},
	showHomePage: function(event) {
		this.togglePages('desc', 'mobile-header');
	},
	showProfilePage: function(event) {
		this.togglePages('profile');
	},
	showProjectsPage: function(event) {
		this.togglePages('projects');
	},
	showMobileMenu: function(event) {
		var $mask = $('#mobile-nav-mask');
		$mask.removeClass('mobile-hide');
		$mask.addClass('mobile-show');
	},
	hideMobileMenu: function(event) {
		var $mask = $('#mobile-nav-mask');
		$mask.removeClass('mobile-show');
		$mask.addClass('mobile-hide');
		
	}
};
$(document).ready(function() {
	window.Profile.init();
});