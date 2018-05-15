!(function($) {
  'use strict';
	
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
	
	$.urlParam = function(name, url){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
		if(results == null){
			return;
		} else {
			return results[1] || 0;
		}
	}
	
	var pm_frontend_scripts = {

		init: function() {
			var self = this,
				$select = $('.pm-select');
				
			$select.each(function(){
				$(this).niceSelect();
				//$(this).chosen({width:"100%"});
			});

			/* advanced search extra field toggle */
			$( '.pm-advance-field' ).on('click', function(){
				var type = $(this).data('type');
				
				if($(this).hasClass('actived')){
					if(type == 'feature'){
						$(this).find('i.fa').removeClass('fa-minus-square').addClass('fa-plus-square');
					}
					$(this).removeClass('actived');
					$(this).parents('.pm-search-form').find('.pm-'+type+'-extra-field-container').slideUp();
				} else {
					if(type == 'feature'){
						$(this).find('i.fa').removeClass('fa-plus-square').addClass('fa-minus-square');
					}
					$(this).addClass('actived');
					$(this).parents('.pm-search-form').find('.pm-'+type+'-extra-field-container').slideDown();
				}
			});
			
			
			// property slider widget
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
			});
			
			/*Gallery single property*/
			$('.single-property .pm-gallery .owl-carousel').owlCarousel({
				items: 1,
				loop: true,
				nav: false,
				dots: false,
				margin:0,
				URLhashListener:true,
				autoplayHoverPause:true,
				startPosition: 'URLHash'
			});
			
			/* search map ajax */
			$('body').on('change', '.pm-field-search', function(){
				search_ajax_func();
				/* var $this = $(this);
				
				var data = $('.pm-map-search-form').serialize();

				$.ajax({
					type: "POST",
					url: pm_ajax_calls.admin_url, 
					data: {
						'action': 'pm_search_map_ajax_func',
						'data': data
					},
					beforeSend: function () {
						$this.parents('.pm-search-container').find('.pm-search-map').find('.pm-map-loading').show();
					},
					success: function (data_return) {
						$this.parents('.pm-search-container').find('.pm-search-map').find('.pm-map-loading').hide();
						$this.parents('.pm-search-container').find('.pm-search-map').data('properties', JSON.parse(data_return));
						window.pmGlobal.initMap();
					}
				}); */
			});
			
			
			/* listing */
			var $grid = $('.pm-post-list .pm-row');
			
			/* pagination */
			$('body').on('click', '.pm-pagination a.page', function(evt){
				evt.preventDefault();
				var _this = $(this);
				if(!$(this).hasClass('current')){
					var paged = $(this).data('paged'),
						total = $(this).parents('.pm-pagination').data('total'),
						args = $(this).parents('.pm-post-list').data('args'),
						column = $(this).parents('.pm-post-list').data('column');
						
					$.ajax({
						type: "POST",
						url: pm_ajax_calls.admin_url, 
						data: {
							'action': 'pm_pagination_ajax_func',
							'args': args,
							'paged': paged,
							'column': column,
							'total': total
						},
						beforeSend: function () {
						},
						success: function (data_return) {
							var data = JSON.parse(data_return);
							
							var $content = $( data.html );
							
							$content.imagesLoaded().done( function() {
								$grid.html($content);
							});
							
							_this.parents('.pm-pagination-wrap').html(data.pagination);
						}
					});
				}
			});
			
			/* post view change */
			$('body').on('click', '.pm-post-view .pm-view-btn', function(evt){
				$(this).parent().find('.pm-view-btn').removeClass('active');
				$(this).addClass('active');
				
				var view = $(this).data('view');
				if(view === 'list'){
					$(this).parents('.pm-post-list').removeClass('pm-post-view-grid').addClass('pm-post-view-list');
				} else {
					$(this).parents('.pm-post-list').removeClass('pm-post-view-list').addClass('pm-post-view-grid');
				}
			});
			
			/* post sort */
			$('body').on('change', '.pm-sort', function(evt){
				var value = $(this).val(),
					href = window.location.href,
					search = window.location.search;
					
				
				if(search){
					if($.urlParam('sortby', href)) {
						var sortby = $.urlParam('sortby', href);

						window.location.assign(href.replace(sortby, value));
					} else {
						window.location.assign(href + '&sortby=' + value);
					}
				} else {
					window.location.assign(href + '?sortby=' + value);
				}
				
			});
			
			/* search field autocomplete */
			$( '.pm-input[name="keyword"]' ).on('keyup', function(e){
				var _this = $(this),
					$wrap = $('#pm_autocomplete_ajax'),
					kw = $(this).val();
				
				if(kw.length >= 2){
					$wrap.show();
					_this.addClass('actived');
					$.ajax({
						type: "POST",
						url: pm_ajax_calls.admin_url, 
						data: {
							'action': 'pm_search_autocomplete_ajax_func',
							'keyword': kw
						},
						beforeSend: function () {
							$wrap.find('.pm-autocomplete-result').html('<p class="pm-autocomplete-loading" style="display: block;"><i class="fa fa-spinner fa-spin fa-fw"></i> Searching...</p>');
						},
						success: function (data_return) {
							$wrap.find('.pm-autocomplete-result').html(data_return);
						}
					});
				} else {
					$wrap.hide();
					$( '.pm-input[name="keyword"]' ).removeClass('actived');
				}
				
			});
			
			$('#pm_autocomplete_ajax').on('click', '.pm-autocomplete-result-item', function(){
				var $this = $(this),
					kw = $(this).data('title'),
					$wrap = $('#pm_autocomplete_ajax');
					
				$( '.pm-input[name="keyword"]' ).val(kw);
				$wrap.hide();
				
				$( '.pm-input[name="keyword"]' ).trigger('change');
				
			});
			
			$('body').on('click', function(){
				$('#pm_autocomplete_ajax').hide();
				$( '.pm-input[name="keyword"]' ).removeClass('actived');
			});
		},
	}
	
	function search_ajax_func() {
		var $form = $('.pm-map-search-form');
		var data = $form.serialize();

		$.ajax({
			type: "POST",
			url: pm_ajax_calls.admin_url, 
			data: {
				'action': 'pm_search_map_ajax_func',
				'data': data
			},
			beforeSend: function () {
				$form.parents('.pm-search-container').find('.pm-search-map').find('.pm-map-loading').show();
			},
			success: function (data_return) {
				$form.parents('.pm-search-container').find('.pm-search-map').find('.pm-map-loading').hide();
				$form.parents('.pm-search-container').find('.pm-search-map').data('properties', JSON.parse(data_return));
				window.pmGlobal.initMap();
			}
		});
	}
	
	$(function() {
		pm_frontend_scripts.init();
	})
})(jQuery)
