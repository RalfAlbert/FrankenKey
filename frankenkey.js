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
 * Format: keycombo -> action
 */
var keymap = {
				// keycombos for inserting tags
                'ctrl+b':	'bold',
                'ctrl+i':	'italic',
                'ctrl+q':	'blockquote',
                'ctrl+d':	'strike',
                'ctrl+s':	'ins',
                'ctrl+u':	'ul',
                'ctrl+o':	'ol',
                'ctrl+l':	'li',
                'ctrl+c':	'code',

                // keycombos for simulated clicks (buttons & links)
                'ctrl+alt+a':	'link',
                'ctrl+m':		'image',
                'ctrl+t':		'more',
                'ctrl+f':		'fullscreen',

                'ctrl+alt+s':	'savepost',
                'ctrl+alt+p':	'preview',
                'ctrl+alt+m':	'addmedia',

                // simple help window (alert)
                'ctrl+alt+h':	'help'
}; // end keymap

/**
 * Wrapping Tags
 * Selected content will be wrapped with these tags.
 * Format: keymap[action] -> tag
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
 * Dialog buttons and links
 * These buttons and links did not wrap content, they start a dialog or do an action e.g. insert an image
 * If the button/link has an id, use '#'+the id. If it has no id, you can try to identify it by one
 * of it's classes. In this case use '.'+class
 * Format: keymap[action] -> element id
 */
var dialogButtons = {

                'link':			'#qt_content_link',
                'image':		'#qt_content_img',
                'more':			'#qt_content_more',
                'fullscreen':	'#qt_content_fullscreen',
                'savepost':		'#save-post',
                'preview':		'#post-preview',
                'addmedia':		'.add_media'

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

        init: function () {

        	var fk = this;

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

                            _oldBind( key, function( event, combo ) { fk.keyFetcher( event, combo ); }, args[1] );

                        }

                    }

                    return true;

                };

                return self;

            }) ( Mousetrap );

            Mousetrap.bind( keymap );

        },

        keyFetcher: function( event, combo ) {

        	// if the focus isn't on the textarea (container), bail and return the event
            if ( false === container.is( ':focus' ) ) {

               return event;

            }

            // prevent default browser behaviour
            event.preventDefault();

            // and finally stop all other handlers
            event.stopPropagation();

            try {

                    var action = keymap[combo];

                    if ( undefined !== wrappingTags[action] ) {

                    	this.wrapWithTags( wrappingTags[action] );

                    }

                    else if ( undefined !== dialogButtons[action] ){

                    	this.clickButton( dialogButtons[action] );
                    }

                    else if ( 'function' === typeof( this[action] ) ) {

                    	this[action] ();

                    }

            }
            // notify developers about failing to assign a keycombo to an action
            catch( e ) {
                    console.log( e );
            }

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

        clickButton: function( button_id ){

        	$( document ).find( button_id ).trigger( 'click' );

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

FrankenKey.init();

}); // end jQuery( document ).ready()