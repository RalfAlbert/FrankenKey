/**
 * FrankenKey
 *
 * @package FrankenKey
 * @author Ralf Albert
 * @version 0.3
 * @date 2012-12-22
 *
 */

jQuery( document ).ready( function( $ ) {


/**
 * Keymap
 * Object contains the shortcut and the internal action object
 * The action object has these propperties:
 *  - type: 	[tag|button|function]
 *  - tag:		Only if type is [tag]. The tag selected text is wrapped in or the tag to open/close
 *  - id:		Only if type is [button]. The element id (#id) or one of it's classes (.class)
 *  - method:	Only if type is [function]. A valid method of the FrankenKey object
 *  - desc:		(optional) A description, shown in the help window
 *
 * Dialog buttons and links
 * These buttons and links did not wrap content, they start a dialog or do an action e.g. insert an image
 * If the button/link has an id, use '#'+id. If it has no id, you can try to identify it by one
 * of it's classes. In this case use '.'+classname
 */
var keymap = {
		'ctrl+alt+w':	{ 'type': 'wide', 'method': 'nothing', 'desc': 'test' },
		'ctrl+alt+v':	{ 'method': 'nothing', 'desc': 'test' },

				// keycombos for inserting tags
				'ctrl+b':		{ 'type': 'tag', 'tag': 'strong', 'desc': 'Bold' },
                'ctrl+i':		{ 'type': 'tag', 'tag': 'em', 'desc': 'Emphasis (italic)' },
                'ctrl+q':		{ 'type': 'tag', 'tag': 'blockquote', 'desc': 'Blockquote' },
                'ctrl+d':		{ 'type': 'tag', 'tag': 'del', 'desc': 'Deleted text' },
                'ctrl+s':		{ 'type': 'tag', 'tag': 'ins', 'desc': 'Inserted text' },
                'ctrl+u':		{ 'type': 'tag', 'tag': 'ul', 'desc': 'Unordered list' },
                'ctrl+o':		{ 'type': 'tag', 'tag': 'ol', 'desc': 'Ordered list' },
                'ctrl+l':		{ 'type': 'tag', 'tag': 'li', 'desc': 'List element' },
                'ctrl+c':		{ 'type': 'tag', 'tag': 'code', 'desc': 'Code' },

                // keycombos for simulated clicks (buttons & links)
				'ctrl+alt+a':	{ 'type': 'button', 'id': '#qt_content_link', 'desc': 'Insert a link' },
                'ctrl+m':		{ 'type': 'button', 'id': '#qt_content_img', 'desc': 'Insert an image' },
                'ctrl+t':		{ 'type': 'button', 'id': '#qt_content_more', 'desc': 'Insert a more-tag' },
                'ctrl+f':		{ 'type': 'button', 'id': '#qt_content_fullscreen', 'desc': 'Switch to fullscreen mode' },

				'ctrl+alt+s':	{ 'type': 'button', 'id': '#save-post', 'desc': 'Save post' },
                'ctrl+alt+p':	{ 'type': 'button', 'id': '#post-preview', 'desc': 'Open post preview' },
                'ctrl+alt+m':	{ 'type': 'button', 'id': '.add_media', 'desc': 'Add media' },

                // simple help window (alert)
				'ctrl+alt+h':	{ 'type': 'method', 'method': 'help', 'desc': 'Show help' },
}; // end keymap

/**
 * FrankenKey
 * This is the part where the shortcuts will be transformed into an action
 * At first FrankenKey try to find a matching tag to wrap the content with or to open/close.
 * If there is no tag to use, it try to open a dialog (like insert an image)
 */
var FrankenKey = {

		/**
		 * Textarea
		 * jQuery object of the textarea where the shortcuts are binded to
		 */
		container:	$( '#content' ),

        /**
         * List with open tags
         * If a tag was open, openTags[tag] is set to true
         * If the tag was closed, openTags[tag] is set to false
         */
        openTags: [],

        init: function () {

        	// needed for binding the keycombos
        	var fk = this;

        	this.createDialogboxes();

            /**
             * Add class 'mousetrap' to bind Mousetrap to the textarea
             */
            this.container.addClass( 'mousetrap' );

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

        createDialogboxes: function(){

        	// common options for dialog boxes
        	var confirm_window_options = {

					resizable:	true,
					hide:		true,
				    modal:		false,
				    autoOpen:	false,
				    buttons:	{
				        			Ok: function() {
				        				$( this ).dialog( "close" );
				        			}
				    			}

        	};

			/*
			 * Create a dialog box for error messages
			 */
        	$( '#wpbody' ).before(
				'<div id="frankenkey-error-confirm" title="FrankenKey Error">' +
				'  <p>' +
				'    <span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>' +
				'    <span id="frankenkey-error-msg"></span>' +
				'  </p>' +
				'</div>'
			);

    		this.err_msg = 		$( '#frankenkey-error-msg' );
    		this.err_confirm =	$( '#frankenkey-error-confirm' );

    		confirm_window_options.resizable = false;
    		confirm_window_options.height	 = 200;

			this.err_confirm.dialog( confirm_window_options );

			/*
			 * Create a help box
			 * Get the description (if available) from the keymap and create a table inside the help box
			 */
			var html = '<table border="1" cellpadding="5" style="border:1px solid black; border-collapse:collapse">' +
            '  <thead>' +
            '    <tr><th>KeyCombo</th><th>Action</th></thead>' +
            '  <tbody>';

            for( var key in keymap ) {

            	var action = keymap[key];
            	var keys = [];
            	var keystr = '';

            	if( undefined !== action.desc && (0 < action.desc.length) ){

            		keys = key.split( '+' );

            		for( var k in keys ){

            			keystr += '[' + keys[k] + ']';
            		}

            		html += '  <tr><td><code>' + keystr + '</code></td><td>' + action.desc + '</td></tr>';

            		keystr = '';
            	}

            }

            html += '  </tbody>' +
            '</table>';


        	$( '#wpbody' ).before(
    				'<div id="frankenkey-help-confirm" title="FrankenKey Help"><p>' +
        			'    <span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 20px 0;"></span>' +
        			html + '</p></div>'
    		);

    		this.help_confirm =	$( '#frankenkey-help-confirm' );

    		confirm_window_options.resizable = true;
    		confirm_window_options.height	 = Math.round( ( window.innerHeight / 4 ) * 3 );
    		confirm_window_options.width	 = 350;

			this.help_confirm.dialog( confirm_window_options );

        },

        keyFetcher: function( event, combo ) {

        	// if the focus isn't on the textarea (container), bail and return the event
            if ( false === this.container.is( ':focus' ) ) {

               return event;

            }

            // prevent default browser behaviour
            event.preventDefault();

            // and finally stop all other handlers
            event.stopPropagation();

            try {

            		var validActions =  [ 'tag', 'button', 'method' ];

                    var action = keymap[combo];
                    var type = action.type;

                    if ( undefined !== type && ( 0 > $.inArray( type, validActions ) ) ) {

                    	action.err = 'Action "<strong>' + type + '</strong>" not defined.';
                    	action.type = 'error';

                    }

                    else if( undefined === type ) {

                    	action.err = 'Undefined action';
                    	action.type = 'error';

                    }

                    switch( action.type ) {

	                    case 'tag':

	                    	this.wrapWithTags( action.tag );

	                    break;

	                    case 'button':

	                    	this.clickButton( action.id );

	                    break;

	                    case 'method':

	                    	if ( 'function' === typeof( this[action.method] ) ) {
	                    		this[action.method] ();
	                    	}

	                    break;

	                    default:

	                    	this.err_msg.html( 'Shortcut "<strong>' + combo + '</strong>" failed in case of bad shortcut definition.<br>' + action.err );
	                    	this.err_confirm.dialog( 'open' );

	                    	return false;

	                    break;

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

                var selection = this.container.getSelection().text;

                if( '' !== selection ) {

                        this.container.wrapSelection( startTag, endTag );

                } else {

                        oTag = this.openTags[tag];

                        if( true !==  oTag ) {

                                this.openTags[tag] = true;

                                this.container.insertAtCaret( startTag );

                        } else {

                                this.openTags[tag] = false;

                                this.container.insertAtCaret( endTag );

                        }

                }

                return true;

        },

        clickButton: function( button_id ){

        	$( document ).find( button_id ).trigger( 'click' );

        },

        help: function() {

                this.help_confirm.dialog( 'open' );

                return true;
        }


	}; // end FrankenKey

FrankenKey.init();

}); // end jQuery( document ).ready()