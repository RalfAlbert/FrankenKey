/**
 * FrankenKey
 *
 * @package FrankenKey
 * @author Ralf Albert
 * @version 0.1
 * @date 2012-12-22
 *
 */

jQuery( document ).ready( function( $ ) {

	/**
	 * Textarea
	 * jQuery object of the textarea where the shortcuts are binded to
	 */
	var container = $( '#content' );

	/**
	 * Keymap
	 * Object contains the shortcut and the internal action to do
	 */
	var keymap = {
			'ctrl+alt+b':	'bold',
			'ctrl+alt+i':	'italic',
			'alt+q':		'blockquote',
			'ctrl+alt+d':	'strike',
			'ctrl+alt+s':	'ins',
			'ctrl+alt+u':	'ul',
			'ctrl+alt+o':	'ol',
			'ctrl+alt+l':	'li',
			'ctrl+alt+c':	'code',

			'ctrl+alt+a':	'link',
			'ctrl+alt+m':	'image',
			'ctrl+alt+t':	'more',
			'ctrl+alt+f':	'fullscreen',

			'ctrl+alt+h':	'help'
	}; // end keymap

	/**
	 * Wrapping Tags
	 * Selected content will be wrapped with these tags.
	 */
	var wrappingTags = {

			'bold':			'strong',
			'italic':		'em',
			'blockquote':	'blockquote',
			'strike':		'del',
			'ins':			'ins',
			'ul':			'ul',
			'ol':			'ol',
			'li':			'li',
			'code':			'code'

	}; // end wrappingTags

	/**
	 * Dialog buttons
	 * These buttons did not wrap content, they start a dialog e.g. insert an image
	 */
	var dialogButtons = {

			'link':			'link',
			'img':			'img',
			'more':			'more',
			'fullscreen':	'fullscreen'

	}; // end dialogButtons


	/**
	 * FrankenKey
	 * This is the part where the shortcuts will be transformed into an action
	 * At first FrankenKey try to find a matching tag to wrap the content with or to open/close.
	 * If there is no tag to use, it try to open a dialog (like insert an image)
	 */
	var FrankenKey = {

			/**
			 * List with open tags
			 * If a tag was open, openTags[tag] is set to true
			 * If the tag was closed, openTags[tag] is set to false
			 */
			openTags: [],

			keyFetcher: function( event, combo ) {

				// prevent default browser behaviour
				event.preventDefault();

				// and finally stop all other handlers
				event.stopPropagation();

				try {

					method = keymap[combo];

					if ( undefined !== wrappingTags[method] ) {

						this.wrapWithTags( wrappingTags[method] );

					}

					else if ( undefined !== dialogButtons[method] ){

						this.clickButton( dialogButtons[method] );
					}

					else if ( 'function' === typeof( this[method] ) ) {
						this[method] ();
					}

				}
				// notify developers about failing to assign a keycombo to an action
				catch( e ) {
					console.log( e );
				}

				finally {}

				// prevent default keypress by returning false
				return false;

			},

			wrapWithTags: function( tag ) {

				var startTag = '<' + tag + '>';
				var endTag	 = '</' + tag + '>';

				var selection = container.getSelection().text;

				if( '' !== selection ) {

					container.wrapSelection( startTag, endTag );

				} else {

					oTag = this.openTags[tag];

					if( true !==  oTag ) {

						this.openTags[tag] = true;

						container.insertAtCaret( startTag );

					} else {

						this.openTags[tag] = false;

						container.insertAtCaret( endTag );

					}

				}

				return true;

			},

			clickButton: function( button ){

				var tb = $( 'div#ed_toolbar' );

				tb.find( '#qt_content_' + button ).trigger( 'click' );

			},

			help: function() {

				var str = '';

				for( var key in keymap ) {
					str += key + ' - ' + keymap[key] + "\n";
				}

				alert( str );

				return true;
			}


	}; // end FrankenKey

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */
	/**
	 * Add class 'mousetrap' to bind Mousetrap to the textarea
	 */
	container.addClass( 'mousetrap' );

	/**
	 * Mousetrap Bind Dictionary
	 * @see: https://gist.github.com/3154320
	 */
	Mousetrap = ( function( Mousetrap ) {

	    var self = Mousetrap,
	        _oldBind = self.bind,
	        args;

	    self.bind = function() {

	        args = arguments;


	        // normal call
	        if( ( typeof args[0] == 'string') || args[0] instanceof Array ) {

	            return _oldBind(args[0], args[1], args[2]);

	        }

	        // object passed in
	        for( var key in args[0] ) {

	            if( args[0].hasOwnProperty( key ) ) {

	            	_oldBind( key, function( event, combo ) { FrankenKey.keyFetcher( event, combo ); }, args[1] );

	            }

	        }

	    };

	    return self;

	}) ( Mousetrap );

	Mousetrap.bind( keymap );

});
