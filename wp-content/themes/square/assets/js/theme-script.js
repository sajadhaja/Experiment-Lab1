/**
 * theme-script.js
 *
 */

!(function($) {
	"use strict";

	String.prototype.replaceMap = function(mapObj) {
	  	var string = this, key;

	  	for (key in mapObj)
	  		string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), mapObj[key]);

	  	return string;
	};

	/**
	 * Custom select ui
	 *
	 */
	$.fn.customSelectUi = function(opts) {
		return $(this).each(function(opts) {
			var self = this,
					_opts = $.extend({
						'className': 'custom-select-ui'
					}, opts);

			$(self).wrap("<div class='{className}'></div>".replaceMap({className: _opts.className}));
		})
	}

	/**
	 * only called once
	 *
	 */
	$.fn._once = function(handle) {
		return $(this).each(function() {
			var $this = $(this);
			if($this.data('bears-once-handle') == true) return;

			$this.data('bears-once-handle', true);
			handle.call(this);
		})
	}

	$.fn.stripClass = function (partialMatch, endOrBegin) {
		var x = new RegExp((!endOrBegin ? "\\b" : "\\S+") + partialMatch + "\\S*", 'g');
		this.attr('class', function (i, c) {
			if (!c) return;
			return c.replace(x, '');
		});
		return this;
	};

	/**
	 * MasonryHybrid
	 * http://plugin.bearsthemes.com/jquery/MasonryHybrid/jquery.masonry-hybrid.js
	 * Create Date: 31-08-2016
	 * Version: 1.0.2
	 * Author: Bearsthemes
	 * Change log:
	 *  + Add options Resposive (v1.0.2)
	 *	+ fix items space wrong when resize browser (v1.0.1)
	 */

	var MasonryHybrid = function($elem, opts) {
		this.elem = $elem;
		this.opts = $.extend({
				itemSelector 	: '.grid-item',
				columnWidth 	: '.grid-sizer',
				gutter 				: '.gutter-sizer',
				col 					: 4,
				space 				: 20,
				percentPosition	: false,
				responsive		: {
					860 : {col: 2},
					420 : {col: 1},
				},
			}, opts);
		// console.log(this.opts);
		this.init();
		return this;
	}

	MasonryHybrid.prototype = {
		init: function() {
			var self = this;

			// call applySelectorClass()
			self.applySelectorClass();

			// call renderStyle()
			self.renderStyle();

			// call applyMasonry()
			self.applyMasonry();

			// apply triggerEvent
			self.triggerEvent();

			// apply window resize (fix)
			self.resizeHandle();

			// window on load complete
			$(window).on('load', function() {
				// f5 grid
				self.elem.trigger('grid:refresh');
			})
		},
		applySelectorClass: function() {
			this.elemClass = 'masonry_hybrid-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 9);
			this.elem.addClass( this.elemClass );
		},
		renderStyle: function() {
			var self = this,
				css = '';

			self.style = $('<style>'),
			css += ' .{elemClass} { margin-left: -{space}px; width: calc(100% + {space}px); transition-property: height, width; }';
			css += ' .{elemClass} {itemSelector}, .{elemClass} {columnWidth} { width: calc(100% / {col}); }';
			css += ' .{elemClass} {gutter} { width: 0; }';
			css += ' .{elemClass} {itemSelector} { float: left; box-sizing: border-box; padding-left: {space}px; padding-bottom: {space}px; }';

			// resize
			css += ' .{elemClass} {itemSelector}.ui-resizable-resizing { z-index: 999 }';
			css += ' .{elemClass} {itemSelector} .screen-size{ visibility: hidden; transition: .5s; -webkit-transition: .5s; opacity: 0; position: absolute; bottom: calc({space}px + 8px); right: 9px; padding: 2px 4px; border-radius: 2px; font-size: 11px; }';
			css += ' .{elemClass} {itemSelector}.ui-resizable-resizing .screen-size{ visibility: visible; opacity: 1; }';
			css += ' .{elemClass} {itemSelector} .ui-resizable-se { right: 0; bottom: {space}px; opacity: 0; }';
			css += ' .{elemClass} {itemSelector}:hover .ui-resizable-se { opacity: 1; }';

			// extra size
			for(var i=1; i <= self.opts.col; i++) {
				var _width = (100 / self.opts.col) * i;
				css += '.{elemClass} .grid-item--width'+ i +' { width: '+ _width +'% }';
			}

			// responsive
			var responsive_css = "";
			if(self.opts.responsive != false) {
				$.each(self.opts.responsive, function($k, $v) {
					responsive_css = ' @media (max-width: '+$k+'px){ .{elemClass} {itemSelector}, .{elemClass} {columnWidth} { width: calc(100% / '+$v.col+'); } }' + responsive_css;
				})
				css += responsive_css;
			}

			// replace
			css = css.replaceMap({
				elemClass			: self.elemClass,
				itemSelector	: self.opts.itemSelector,
				gutter 				: self.opts.gutter,
				columnWidth		: self.opts.columnWidth,
				space					: self.opts.space,
				col 					: self.opts.col });

			self.elem.prepend( self.style.html( css ) );
		},
		clearStyle: function() {
			this.style.remove();
			return this;
		},
		applyMasonry: function() {
			var self = this;

			this.grid = self.elem.isotope({
			  	itemSelector: self.opts.itemSelector,
			  	percentPosition: self.opts.percentPosition,
			  	masonry: {
			    	columnWidth: self.opts.columnWidth,
			    	gutter: self.opts.gutter,
			  	}
			});
		},
		resizeHandle: function() {
			var self = this;
			this.is_window_resize = '';

			// fix window resize
			$(window).on('resize.MasonryHybrid', function() {
				/* check is resize */
				if(this.is_window_resize) { self.clearTimeout(self.is_window_resize) }

				/* refresh */
				self.is_window_resize = setTimeout(function() {
					self.elem.trigger('grid:refresh');
				}, 100)
			})
		},
		triggerEvent: function() {
			var self = this;

			self.elem.on({
				'grid:refresh': function(e, opts_update) {
					if( opts_update ) {
						self.opts = $.extend(self.opts, opts_update);
						self.clearStyle().renderStyle();
					}

					// trigger layout
	  				self.grid.isotope('layout').delay(500).queue(function() {
	  					self.grid.isotope('layout');
	  					$(this).dequeue();
	  				});
				}
			})
		}
	}

	MasonryHybrid.prototype.resize = function(opts) {
		var self = this;
			self._resize = {};

		// set options
		self._resize.opts = $.extend({
			celHeight 	: 140,
			sizeMap 	: [[1,1]],
			resize 		: false,
		}, opts);

		// func applySize
		self._resize.applySize = function() {
			var countItem = self.elem.find(self.opts.itemSelector).length,
				countSizeMap = self._resize.opts.sizeMap.length;

			for(var i = 0, j = 0; i <= countItem; i++) {
				var _width = self._resize.opts.sizeMap[j][0],
					_height = self._resize.opts.celHeight * self._resize.opts.sizeMap[j][1];

				self.elem.find(self.opts.itemSelector).eq(i)
				.data('grid-size', [self._resize.opts.sizeMap[j][0], self._resize.opts.sizeMap[j][1]])
				.stripClass('grid-item--width')
				.addClass('grid-item--width'+_width)
				.css({
					height: _height,
				})

				j++; if(j == countSizeMap) j = 0; // back to top arr
			}
			self.elem.trigger('grid:refresh');
		}
		self._resize.applySize();

		// func getSizeMap
		self._resize.getSizeMap = function() {
			var countItem = self.elem.find(self.opts.itemSelector).length,
				sizeMap = [];

			for(var i = 0; i <= (countItem - 1); i++) {
				var _elem = self.elem.find( self.opts.itemSelector ).eq(i),
					_gridSize = _elem.data('grid-size');

				sizeMap.push([_gridSize[0], _gridSize[1]]);
			}

			return sizeMap;
		}

		// func setSizeMap
		self._resize.setSizeMap = function(sizeMap) {
			if(!sizeMap) return;

			self._resize.opts.sizeMap = sizeMap;
			return this;
		}

		// func resizeHandle (resize item masonry)
		self._resize.resizeHandle = function() {
			if(self._resize.opts.resize == false) return;

			self.elem.find(self.opts.itemSelector).resizable({
				handles: 'se',
				start: function() {
					if($(this).find('.screen-size').length <= 0) {
						this.screenSize = $('<span>', {class: 'screen-size'});
						$(this).append(this.screenSize);
					}else {
						this.screenSize = $(this).find('.screen-size');
					}
				},
				resize: function(event, ui) {
					ui.size.width = ui.size.width + self.opts.space;
					ui.size.height = ui.size.height + self.opts.space;

					var pointerItem = this.getBoundingClientRect(),
						containerWidth = self.elem.width(),
						celWidth = parseInt((containerWidth / 100) * (100 / self.opts.col));

					this.step_w = Math.round(ui.size.width/celWidth),
					this.step_h = Math.round(ui.size.height/self._resize.opts.celHeight);

					if(this.step_w <= 0) this.step_w = 1;
					if(this.step_h <= 0) this.step_h = 1;

					this.screenSize.html(this.step_w+' x '+this.step_h);
				},
				stop: function(event, ui) {
					// reset css width/height inline & set item size data
					$(this).css({
						width: '',
						height: '',
					}).data('grid-size', [this.step_w, this.step_h]);
					self._resize.opts.sizeMap = self._resize.getSizeMap();
					self._resize.applySize();
				}
			});
		}
		self._resize.resizeHandle();

		return self._resize;
	}
	/**
	 * End MasonryHybrid
	 */

	/* Global Variables */
	var screenRes = $(window).width(),
        screenHeight = $(window).height(),
        innerScreenRes = window.innerWidth, // Screen size width minus scrollbar width
        html = $('html');

    var Bears = {}

	Bears.OffCanvasMenu = function() {
		$('body').on('click', '.menu-item-custom-type-off-cavans-menu > a', function(e) {
			e.preventDefault();
			$(this).parent('li').toggleClass('off-canvas-menu-is-open');
			$('body').toggleClass('body-off-canvas-menu-is-open');
		})

		$('body').on('click', '.off-canvas-menu-closed', function(e) {
			$('.off-canvas-menu-is-open, .body-off-canvas-menu-is-open').removeClass('off-canvas-menu-is-open body-off-canvas-menu-is-open')
		})

		$('body').on('click', '.off-canvas-menu-wrap', function(e) {
			if($(e.target).hasClass('off-canvas-menu-wrap')){
				$('.off-canvas-menu-is-open, .body-off-canvas-menu-is-open').removeClass('off-canvas-menu-is-open body-off-canvas-menu-is-open')
			}
		})
	}

	Bears.OffCanvasMenuItemToggle = function() {
		var $items = $('.menu-item-custom-wrap.off-canvas-menu-wrap');

		$items.each(function() {
			var $offcanvas_wrap = $(this);

			$offcanvas_wrap.find('.menu-item-has-children').each(function() {
				var $menu_item = $(this),
						$toggle_button = $('<div>', {class: 'menu-offcanvas-toggle-ui', 'html': ''});

				$toggle_button.on('click', function(e) {
					e.preventDefault();

					$(this).toggleClass('is-open');
					$menu_item.children('.sub-menu').slideToggle('slow');
				})

				/* append button toggle */
				$menu_item.children('a').append($toggle_button);
			})
		})
	}

	Bears.MenuItemCustom = function() {
		var item_class = [
			'.menu-item-custom-type-search > a', // type search
			'.menu-item-custom-type-sidebar > a', // type sidebar
			'.menu-item-custom-type-woocommerce-mini-cart > a', // type woocommerce-mini-cart
			'.menu-item-custom-type-property-mini-search > a', // type property-mini-search
			];
		$('body').on('click.menuItemCustom', item_class.join(', '), function(e) {
			e.preventDefault();

			//
			if($(this).parent('li').hasClass('menu-custom-is-active')) {
				$(this).parent('li').removeClass('menu-custom-is-active');
				return;
			}

			// clear all class is active
			$(this).parents('nav.bt-site-navigation').find('.menu-custom-is-active').removeClass('menu-custom-is-active');

			// active this item
			$(this).parent('li').toggleClass('menu-custom-is-active');
		})

		$('div#page').on('click.menuItemCustom', function(e) {
			// alert($(e.target).parents('.menu-custom-is-active').length);
			if($(e.target).parents('.menu-custom-is-active').length <= 0) {
				$(this).find('.menu-custom-is-active').removeClass('menu-custom-is-active');
			}
		})
	}

	Bears.HeaderSticky = function($opts) {
		this.opts = $.extend({
			header_elem: '',
		}, $opts);

		// check header_elem exist
		if(this.opts.header_elem == '' || this.opts.header_elem.length <= 0) return;

		var self = this;
			self.body = $('body'),
			self.header_absolute = false,
			self.logoContainer = this.opts.header_elem.find('.fw-site-logo'),
			self.header_info = {top: 0, height: 0};

		// init
		this.init = function() {
			self.header_info = {
				top: self.opts.header_elem.offset().top,
				height: self.opts.header_elem.innerHeight(),
			}

			// check header absolute exist
			self.header_absolute = (self.opts.header_elem.hasClass('fw-absolute-header')) ? true : false;

			// call scrollHandle()
			self.scrollHandle();
		}

		// scroll handle
		this.scrollHandle = function() {
			$(window).on('scroll.HeaderSticky', function(e) {
				var windowTop = $(this).scrollTop();

				if( windowTop >= (self.header_info.top + self.header_info.height) ) {
					// transfrom header stick
					if(!self.body.hasClass('is-header-sticky')){
						self.body.addClass('is-header-sticky');

						// fix smooth sticky header
						if(self.header_absolute == false)
							self.opts.header_elem.parent().height(self.header_info.height);

						// logo sticky switch
						self.stickyLogoSwitch(true);
					}
				} else {
				 	// remove header stick
				 	if(self.body.hasClass('is-header-sticky')){
						self.body.removeClass('is-header-sticky');

						// fix smooth sticky header
						if(self.header_absolute == false)
							self.opts.header_elem.parent().height('auto');

						// logo sticky switch
						self.stickyLogoSwitch(false);
				 	}
				}
			}).trigger('scroll.HeaderSticky');
		}

		// sticky logo heandle
		this.stickyLogoSwitch = function($sticky_status) {
			if(self.logoContainer.find('.sticky-logo').length <= 0) return;

			if($sticky_status == true) {
				self.logoContainer.addClass('logo-sticky-is-enable');
			}else {
				self.logoContainer.removeClass('logo-sticky-is-enable');
			}
		}

		// call init()
		this.init();
	}

	Bears.owlCarousel = function() {
		var $owlCarousel_items = $('[data-bears-owl-carousel]');

		$owlCarousel_items.each(function() {
			// options
			var $this = $(this);

			var opts = $.extend({
				items: 1,
				loop:true,
			    margin:0,
			    nav:true,
			    navText: ['<i class="ion-ios-arrow-left" title="Previous"></i>', '<i class="ion-ios-arrow-right" title="Next"></i>'],
			}, $this.data('bears-owl-carousel'));


			$this._once(function() {
				// apply owl carousel
				var owlObject = $(this).owlCarousel(opts);
				// saving owlObject
				$(this).data('owl-object', owlObject);
			})
		})
	}

	Bears.lightgallery = function() {
		var $lightgallery_items = $('[data-bears-lightgallery]');

		$lightgallery_items.each(function() {

			// options
			var opts = $.extend({
				selector: '.item',

				loadYoutubeThumbnail: true,
				youtubeThumbSize: 'default',
				loadVimeoThumbnail: true,
				vimeoThumbSize: 'thumbnail_medium',
				youtubePlayerParams: {
					modestbranding: 1,
					showinfo: 0,
					rel: 0,
					controls: 1
				},
				vimeoPlayerParams: {
					byline : 0,
					portrait : 0,
					color : 'A90707',
				}
			}, $(this).data('bears-lightgallery'));

			// apply lightGallery
			var lightGalleryObject = $(this).lightGallery(opts);

			// saving owlObject
			$(this).data('lightgallery-object', lightGalleryObject);
		})
	}

	Bears.MasonryHybrid = function() {
		var $masonryhybrid_items = $('[data-bears-masonryhybrid]');

		$masonryhybrid_items.each(function() {
			var opts = $.extend({
				col		: 2,
				space	: 30
			}, $(this).data('bears-masonryhybrid'))

			$(this)._once(function() {
				// check grid item exist
				if($(this).find('.grid-item, .grid-item_, .grid-item__, .grid-item___').length <= 0) return;

				// apply MasonryHybrid
				var grid = new MasonryHybrid($(this), opts);

				// apply resize MasonryHybrid
				if($(this).data('bears-masonryhybrid-resize')) {
					var resize_opts = $.extend({
						celHeight 	: 180,
						resize 			: false,
					}, $(this).data('bears-masonryhybrid-resize'));

					// console.log(resize_opts);
					var gridResize = grid.resize(resize_opts);

					// save layout handle
					if(resize_opts.resize == true) Bears.MasonryHybridSaveGridHandle({grid: grid, gridResize: gridResize});
				}

				// apply filter
				if(opts.filter_selector && $(opts.filter_selector).length > 0) {
					$(opts.filter_selector).on('click', 'a[data-filter]', function(e) {
						e.preventDefault();
						$(this).addClass('is-active').siblings().removeClass('is-active');
						grid.grid.isotope({ filter: $(this).data('filter') });
					})
				}
			})
		})
	}

	Bears.MasonryHybridSaveGridHandle = function(obj) {
		var grid_name = obj.grid._resize.opts.grid_name,
				button_save = $('<button type="button" class="save-grid-js" title="save grid layout"><i class="fa fa-spinner fa-spin"></i> Save</button>');

		button_save.on('click', function(e) {
			e.preventDefault();
			var grid_map = obj.gridResize.getSizeMap();

			button_save.addClass('ajax-loading');

			$.ajax({
				type: "POST",
				url: BtPhpVars.ajax_url,
				data: {action: '_square_save_gridmap_masonryhybrid', params: {gridname: grid_name, gridmap: grid_map}},
				success: function(result) {
					console.log(result)
					button_save.removeClass('ajax-loading');
				},
				error: function(e) {
					alert('Error: ' + JSON.stringify(e) + ' - ' + BtPhpVars.fail_form_error);
				}
			})
		})

		$(obj.grid.elem).append(button_save);
	}

	Bears.countdown = function() {
		var $countdown_items = $('[data-bears-countdown]');

		$countdown_items.each(function() {
			var $this = $(this),
					data = $this.data('bears-countdown'),
					date_end = data.date_end,
					template = data.template;
			console.log(data);
			$this._once(function() {
				$this.countdown({
					until: new Date(date_end),
					format: template,
			  });
			})
		})
	}

	/**
	 * builderElementHandle
	 */
	Bears.builderElementHandle = function() {
		var current_url = window.location.href;

		/* check is builder mode */
		if(current_url.search('cornerstone_preview') < 0) return;

		/* resize window fix element */
		$(window).load(function() {
			console.log(window.parent.document.getElementsByClassName('cs-preloader').length);
			window.BearsBuilderLoopRenderSuccess = setInterval(function() {
				if(window.parent.document.getElementsByClassName('cs-preloader').length <= 0) {
					$('body, html').trigger('resize');
					clearInterval(window.BearsBuilderLoopRenderSuccess);
				}
			}, 2000)
		})

		/* re-call function */
		window.BearsBuilderElementHandle = setInterval(function() {
			/* re-call owlCarousel */
			Bears.owlCarousel();
			/* re-call MasonryHybrid */
			Bears.MasonryHybrid();
			/* re-call Countdown */
			Bears.countdown();
		}, 1000)
	}

	Bears.BacktoTopButton = function() {
		var $button = $('#scroll-to-top-button');
		if($button.length <= 0) return;

		$button.on('click', function(e) {
			e.preventDefault();

			$('html, body').animate({
				scrollTop: 0
			}, 1000)
		})

		$(window).on('scroll.back_to_top', function() {
			if($(this).scrollTop() > $(this).height()) {
				if(! $button.hasClass('is-display')) $button.addClass('is-display');
			}else {
				if($button.hasClass('is-display')) $button.removeClass('is-display');
			}
		})
	}

	Bears.customSelectUi = function() {
		$('select[data-custom-select-ui]').customSelectUi();
		$('.widget_wpurp_recipe_search_widget select').customSelectUi();
	}

	Bears.FollowScreen = function() {
		var $elements = $('[data-follow-screen]');

		$elements.each(function() {
			var elem = $(this),
					elemInfo = {top: elem.offset().top, height: elem.innerHeight()},
					opts = $.extend({
						position: 'bottom-right',
					}, elem.data('follow-screen'));

			var close_follow = $('<div>', {class: 'follow-screen-close', 'html': '<i class="fa fa-times" aria-hidden="true"></i>'}).css('display', 'none');
			elem.append(close_follow);

			var elem_shadow = $('<div>', {class: 'followscreen-shadow'}).css('display','none');
			elem.after(elem_shadow);

			close_follow.on('click', function(e) {
				e.preventDefault();
				elem.removeClass('followscreen-is-active followscreen-position-' + opts.position).addClass('followscreen-off');
				elem_shadow.css('display', 'none');
			})

			$(window).on({
				'scroll.followscreen': function(e) {
					if(this.pageYOffset > (elemInfo.top + elemInfo.height) && ! elem.hasClass('followscreen-off')) {
						elem.addClass('followscreen-is-active followscreen-position-' + opts.position);
						elem_shadow.css({
							paddingBottom: elemInfo.height,
							display: 'block',
						})
					} else {
						elem.removeClass('followscreen-is-active followscreen-position-' + opts.position);
						elem_shadow.css('display', 'none');
						elemInfo = {top: elem.offset().top, height: elem.innerHeight()};
					}
				}
			})
		})
	}

	Bears.init = function() {

		Bears.OffCanvasMenu();

		Bears.OffCanvasMenuItemToggle();

		Bears.MenuItemCustom();

		Bears.BacktoTopButton();

		// header sticky
		var header_sticky_opts = {
			header_elem: $('.fw-sticky-header').first(),
		}
		new Bears.HeaderSticky(header_sticky_opts);

		// lightgallery
		Bears.lightgallery();

		// MasonryHybrid
		Bears.MasonryHybrid();

		Bears.FollowScreen();

		// owl.Carousel
		Bears.owlCarousel();

		// countdown
		Bears.countdown();

		Bears.customSelectUi();

		// builderElementHandle
		Bears.builderElementHandle();

	}

	/* DOM Ready */
	$(function() {

		jQuery.fn.isOnScreen = function(){
	        var win = $(window);
	        var viewport = {
	            top : win.scrollTop(),
	            left : win.scrollLeft()
	        };
	        viewport.right = viewport.left + win.width();
	        viewport.bottom = viewport.top + win.height();

	        var bounds = this.offset();
	        bounds.right = bounds.left + this.outerWidth();
	        bounds.bottom = bounds.top + this.outerHeight();
	        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	    };

		// Animate Things (some online tools for responsive test has 760px)
	    if( screenRes > 760 || BtPhpVars.smartphone_animations == 'yes' ){
	        jQuery(".fw-animated-element").each(function () {
	            var animationElement = $(this),
	                delayAnimation = parseInt(animationElement.data('animation-delay')) / 1000,
	                typeAnimation = animationElement.data('animation-type');

	            if(animationElement.isOnScreen()) {
	                if (!animationElement.hasClass("animated")) {
	                    animationElement.addClass("animated").addClass(typeAnimation).trigger('animateIn');
	                }
	                animationElement.css({
	                    '-webkit-animation-delay': delayAnimation + 's',
	                    'animation-delay': delayAnimation + 's'
	                });
	            }
	            $(window).scroll(function () {
	                var top = animationElement.offset().top,
	                    bottom = animationElement.outerHeight() + top,
	                    scrollTop = $(this).scrollTop(),
	                    top = top - screenHeight;

	                if ((scrollTop > top) && (scrollTop < bottom)) {
	                    if (!animationElement.hasClass("animated")) {
	                        animationElement.addClass("animated").addClass(typeAnimation).trigger('animateIn');
	                    }
	                    animationElement.css({
	                        '-webkit-animation-delay': delayAnimation + 's',
	                        'animation-delay': delayAnimation + 's'
	                    });
	                    // Disable animation fill mode the reason that creates problems,
	                    // on hover animation some shortcodes and video full screen in Google Chrome
	                    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	                    jQuery('.animated').one(animationEnd, function() {
	                        $(this).addClass('fill-mode-none');
	                    });
	                }
	            });
	        });
	    }

	    // use Bears Api
	    Bears.init();

			// bootstrap tooltip
			var bootstrapTooltip = function() {
				$('[data-toggle="tooltip"]').tooltip();
			}
			bootstrapTooltip();

			// vimeo frame Api
			function bearsthemes_autoplay_mute_post_layout_creative_vimeo_iframe_api() {
				$('.post-list-type-blog-2').find('.post-video-wrap.video-type-embed').each(function() {
					var iframe = $(this).children('iframe'),
							src = iframe.attr('src');

					// check is iframe youtube
					if(src.search('vimeo') > 0) {
						iframe.player = $f(iframe[0]);
						iframe.player.addEvent('ready', function() {
							iframe.player.api('play');
							iframe.player.api('setVolume', 0);
						})
					}
				})
			}
			bearsthemes_autoplay_mute_post_layout_creative_vimeo_iframe_api();

			// youtube iframe Api
			function bearsthemes_autoplay_mute_post_layout_creative_youtube_iframe_api() {
					$('.post-list-type-blog-2').find('.post-video-wrap.video-type-embed').each(function() {
						var iframe = $(this).children('iframe'),
								src = iframe.attr('src'),
								id = 'frame-tube-' + Math.random().toString(36).substring(7);

						// add id
						iframe.attr('id', id);

						// check is iframe youtube
						if(src.search('tube') > 0) {
							iframe.player = new YT.Player(id, {
					        events: {
					            'onReady': function(event) {
												iframe.player.mute();
										    iframe.player.playVideo();
											}
					        }
					    });
						}
					})
			}

			// create tag script
			function load_script_youtube_api_player() {
				var tag = document.createElement('script');
	      tag.src = "https://www.youtube.com/iframe_api";
	      var firstScriptTag = document.getElementsByTagName('script')[0];

				var has_include = false;
				$('script').each(function() {
					if(this.src == tag.src) {	has_include = true; return false; }
				})

				if(has_include == false) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
			load_script_youtube_api_player();

			window.onYouTubePlayerAPIReady = function() {
	      bearsthemes_autoplay_mute_post_layout_creative_youtube_iframe_api();
	    };
	})

	/* Window load function */
	$(window).load(function () {

	    // Parallax effect function
	    function parallaxFn(event) {
	        $.stellar({
						responsive: false,
						horizontalScrolling: false,
						// positionProperty: 'transform',
	        });
	    }

	    parallaxFn();
	});

	/*Gallery single property*/
	$('.single-property .bt-gallery .owl-carousel').owlCarousel({
	  items: 1,
	  loop: true,
		nav: false,
		dots: true,
	});

	/*Agent send mail*/
	$('#bt-agent-request-form').submit(function (e) {
		e.preventDefault();
		var label_btn = $('#bt-agent-request-form input[name="submit"]').val();
		$.ajax({
			url: BtPhpVars.ajax_url,
			type: 'post',
			data: {
					'action':'square_agent_send_mail',
					'agent_id' : $('#bt-agent-request-form input[name="agent_id"]').val(),
					'name' : $('#bt-agent-request-form input[name="name"]').val(),
					'phone' : $('#bt-agent-request-form input[name="phone"]').val(),
					'email' : $('#bt-agent-request-form input[name="email"]').val(),
					'content' : $('#bt-agent-request-form textarea[name="content"]').val()
			},
			beforeSend: function () {
				$('#bt-agent-request-form input[name="submit"]').attr('value', 'Loading...');
				$('#bt-agent-request-form').find('.bt-status').remove();
      },
			error: function(data){
				$('#bt-agent-request-form input[name="submit"]').attr('value', label_btn);
				$('#bt-agent-request-form').append('<span class="bt-status">Failed to send email.</span>');
			},
			success: function (data) {
				$('#bt-agent-request-form input[name="submit"]').attr('value', label_btn);
				$('#bt-agent-request-form').append('<span class="bt-status">Contact message sent.</span>');
			}
		});
	});

})(jQuery)
