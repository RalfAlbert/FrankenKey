jQuery( document ).ready( function ( $ ) {

	var elements = {
			'a':		'purple',
			'input':	'magenta',
			'select':	'aqua'
	};

	var doc = $( document );

	$.each( elements, function( elem, color ){

		var find = '#post ' + elem + ':visible';

		doc.find( find ).each( function () {

			var id = $( this ).attr( 'id' );
			var classes = $( this ).attr( 'class' );

			var okColor = 'green';

			if( undefined === id ){

				okColor = 'red';

			}

			if( undefined === id && undefined !== classes){

				okColor = 'gold';

			}


			$( this ).css( 'border', '2px solid ' + color );
			$( this ).css( 'border-radius', '3px' );
			$( this ).css( 'background-color', okColor );
			$( this ).css( 'opacity', '0.5' );

		});

	});

});