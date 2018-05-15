!(function($) {
  'use strict';

	var pm_ranges_scripts = {

		init: function() {
			var self = this,
          valueMin = $( '.valueMin' ).val(),
          valueMax = $( '.valueMax' ).val(),
          min = $('.sliderRange').data('min'),
          max = $('.sliderRange').data('max');

      $( '.sliderRange' ).slider({
			range: true,
			min: min,
			max: max,
			values: [ valueMin, valueMax ],
			slide: function( event, ui ) {
				$(this).parents('.pm-ranges-wrapper').find( '.valueRanges' ).html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
				$(this).parents('.pm-ranges-wrapper').find( '.valueMin' ).val(ui.values[ 0 ]);
				$(this).parents('.pm-ranges-wrapper').find( '.valueMax' ).val(ui.values[ 1 ]);
			},
			stop: function( event, ui ) {
				if($('#googleMap').length != 0){
					var data = $('.pm-map-search-form').serialize();
		
					$.ajax({
						type: "POST",
						url: pm_ajax_calls.admin_url, 
						data: {
							'action': 'pm_search_map_ajax_func',
							'data': data
						},
						beforeSend: function () {
							$('#googleMap').parents('.pm-search-map').find('.pm-map-loading').show();
						},
						success: function (data_return) {
							$('#googleMap').parents('.pm-search-map').find('.pm-map-loading').hide();
							$('#googleMap').parents('.pm-search-map').data('properties', JSON.parse(data_return));
							window.pmGlobal.initMap();
						}
					});
				}
			}
      });

		},
	}

	$(function() {
		pm_ranges_scripts.init();
	})
})(jQuery)
