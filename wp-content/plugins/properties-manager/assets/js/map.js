!(function($) {
  'use strict';

	// variable to hold a map
	var map;
	
	// variable to hold current active InfoWindow
	var activeInfoWindow;
		
	window.pmGlobal = {};
	
	window.pmGlobal.initMap = function() {
		var mapContainer = document.getElementById('googleMap');
		
		if(mapContainer){
			
			var properties = $('#googleMap').parents('.pm-search-map').data('properties'),
				//properties = $('#googleMap').parents('.pm-search-map').find('.pm-search-map-data').val(),
				zoom = $('#googleMap').parents('.pm-search-map').data('zoom'),
				position = {lat: 16.071715, lng: 108.223565};

			if(!zoom){
				zoom = parseInt(pm_map_calls.map_zoom);
			}
			
			if(properties.length != 0){
				position = {lat: parseFloat(properties[0].lat), lng: parseFloat(properties[0].lng)};
			}
			
			if(properties.length != 0){
				// map options
				var mapOptions = {
					zoom : zoom, 
					draggable: true,
					center : position,
					scrollwheel: false,
					mapTypeId : google.maps.MapTypeId.ROADMAP
				};
				
				// create map
				map = new google.maps.Map(mapContainer, mapOptions);
				
				var markers = properties.map(function(property, i) {
					var location = {lat:parseFloat(property.lat), lng:parseFloat(property.lng)};
					var icon = property.markers;
					
					var content = 	'<div class="pm-marker-item">' +
										'<div class="pm-marker-image">' +
											'<div class="pm-marker-image-inner" >' +
												'<div class="centered">' +
													'<img src="' + property.image + '" alt="' + property.title + '" />' + 
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="pm-marker-info">' +
											'<h3 class="price">' + property.price + '</h3>' +
											'<h4 class="title">' + property.title + '</h4>' +
											'<p class="address">' + property.address + '</p>' +
											'<a href="' + property.permalink + '" class="details">Details <i class="fa fa-caret-right" aria-hidden="true"></i></a>' +
										'</div>' +
									'</div>';
					
					return fnPlaceMarkers(location, icon, content);
					
				});
			} else {
				$('#googleMap').html('<h4 class="pm-search-not-found">Sorry No Property Found</h4>');
			}
			
			// create map marker cluster
			var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
		}
		
	}
	
	// ------------------------------------------------------------------------------- //
	// create markers on the map
	// ------------------------------------------------------------------------------- //
	function fnPlaceMarkers(position, marker_url, content) {
		var icon = {
			url: marker_url,
		};
		
		var marker = new google.maps.Marker({
			position : position,
			icon : icon,
			animation : google.maps.Animation.DROP
		});
	
		// Renders the marker on the specified map
		marker.setMap(map);	

		// create an InfoWindow -  for mouseclick
		var infowindow = new google.maps.InfoWindow();

		/* --------------------------------
		 * ON MARKER CLICK - (Mouse click)
		 * -------------------------------- */
		
		// add content to InfoWindow for click event 
		infowindow.setContent(content);
		
		// add listener on InfoWindow for click event
		google.maps.event.addListener(marker, 'click', function() {
			map.setCenter(position);
			
			//Close active window if exists			
			if(activeInfoWindow != null) activeInfoWindow.close();

			// Open InfoWindow - on click 
			infowindow.open(map, marker);
			
			// Store new open InfoWindow in global variable
			activeInfoWindow = infowindow;
		}); 	

		google.maps.event.addListener(infowindow, 'domready', function() {

			// Reference to the DIV that wraps the bottom of infowindow
			var iwOuter = $('.gm-style-iw');

			iwOuter.css({'top' : '20px'});
			
			iwOuter.children().css({'overflow' : 'hidden'});
			
			var iwBackground = iwOuter.prev();

			// Removes background shadow DIV
			iwBackground.children(':nth-child(2)').css({'display' : 'none'});

			// Removes white background DIV
			iwBackground.children(':nth-child(4)').css({'display' : 'none'});

			iwBackground.children(':nth-child(3)').children(':nth-child(1)').children().css({height: '40px', width: '30px', left: '0px', transform: 'skewX(38deg)'});
			iwBackground.children(':nth-child(3)').children(':nth-child(2)').children().css({height: '40px', width: '15px', left: '0px', transform: 'skewX(-38deg)'});
			
			// Reference to the div that groups the close button elements.
			var iwCloseBtn = iwOuter.next();

			iwCloseBtn.css({right: '50px', top: '30px'});
			
			iwCloseBtn.next().css({width: '13px', height: '13px', overflow: 'hidden', right: '50px', top: '30px'});

		});
		
		return marker;
	}
	
	google.maps.event.addDomListener(window, 'load', window.pmGlobal.initMap);
	
	
})(jQuery)
