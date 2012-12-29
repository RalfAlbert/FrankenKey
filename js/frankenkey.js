/**
 * FrankenKey
 *
 * @package FrankenKey
 * @author Ralf Albert
 * @version 0.4
 * @date 2012-12-22
 *
 */

jQuery( document ).ready( function( $ ) {


/**
 * FrankenKey
 * This is the part where the shortcuts will be transformed into an action
 * At first FrankenKey try to find a matching tag to wrap the content with or to open/close.
 * If there is no tag to use, it try to open a dialog (like insert an image)
 */
var FrankenKey = {

		/**
		 * Container for translated strings
		 */
		trans: {},

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
		keymap:  {

						// debugging & testing
//						'ctrl+alt+w':	{ 'type': 'wide', 'method': 'nothing', 'desc': 'test' },
//						'ctrl+alt+v':	{ 'method': 'nothing', 'desc': 'test' },

						// keycombos for inserting tags
//						'ctrl+b':		{ 'type': 'tag', 'tag': 'strong', 'desc': 'Bold' },
//		                'ctrl+i':		{ 'type': 'tag', 'tag': 'em', 'desc': 'Emphasis (italic)' },
//		                'ctrl+q':		{ 'type': 'tag', 'tag': 'blockquote', 'desc': 'Blockquote' },
//		                'ctrl+d':		{ 'type': 'tag', 'tag': 'del', 'desc': 'Deleted text' },
//		                'ctrl+s':		{ 'type': 'tag', 'tag': 'ins', 'desc': 'Inserted text' },
//		                'ctrl+u':		{ 'type': 'tag', 'tag': 'ul', 'desc': 'Unordered list' },
//		                'ctrl+o':		{ 'type': 'tag', 'tag': 'ol', 'desc': 'Ordered list' },
//		                'ctrl+l':		{ 'type': 'tag', 'tag': 'li', 'desc': 'List element' },
//		                'ctrl+c':		{ 'type': 'tag', 'tag': 'code', 'desc': 'Code' },

		                // keycombos for simulated clicks (buttons & links)
//						'ctrl+alt+a':	{ 'type': 'button', 'id': '#qt_content_link', 'desc': 'Insert a link' },
//		                'ctrl+m':		{ 'type': 'button', 'id': '#qt_content_img', 'desc': 'Insert an image' },
//		                'ctrl+t':		{ 'type': 'button', 'id': '#qt_content_more', 'desc': 'Insert a more-tag' },
//		                'ctrl+f':		{ 'type': 'button', 'id': '#qt_content_fullscreen', 'desc': 'Switch to fullscreen mode' },

//						'ctrl+alt+s':	{ 'type': 'button', 'id': '#save-post', 'desc': 'Save post' },
//		                'ctrl+alt+p':	{ 'type': 'button', 'id': '#post-preview', 'desc': 'Open post preview' },
//		                'ctrl+alt+m':	{ 'type': 'button', 'id': '.add_media', 'desc': 'Add media' },

		                // simple help window (alert)
						'ctrl+alt+h':	{ 'type': 'method', 'method': 'help', 'desc': 'Show help' },
		}, // end keymap

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

        /**
         * If something went wrong while initialisation
         */
        initErrors: {},

        /**
         * Initialisation
         */
        init: function () {

        	// needed for binding the keycombos
        	var frankenkey = this;

        	frankenkey.trans = ( undefined !== FrankenKeyTranslation ) ?
        		FrankenKeyTranslation : null;

        	// get the keymap from database (stored as script in the DOM)
        	if( undefined !== FrankenKeyKeymap ){

        		$.each(
        				FrankenKeyKeymap,
        				function ( combo ) {
        					var data = $.parseJSON( FrankenKeyKeymap[combo] );

        					if( 'object' === typeof( data ) ) {
        						frankenkey.keymap[combo] = data;
        					}

        				}
        		);

        	}

        	/**
        	 * Early aborting if neccassary things was not initialized
        	 */

        	// check if translation was initialized
        	if( 'object' !== typeof( frankenkey.trans ) || null === frankenkey.trans ) {

        		frankenkey.trans = {};

        		frankenkey.trans.init_translation_error = 'Can not load translation.';
        		frankenkey.trans.init_keymap_error = 'Can not load keymap.';

        		frankenkey.initErrors.translation = frankenkey.trans.init_translation_error;

        	}

        	// check if the keymap was initialized
        	if( 'object' !== typeof( FrankenKeyKeymap ) || null === FrankenKeyKeymap ) {

        		frankenkey.initErrors.keymap = frankenkey.trans.init_keymap_error;

        	}

        	// check if any errors occured
        	if( undefined !== frankenkey.initErrors.length ) {

        		var errorOutput = '';

        		$.each(
        			frankenkey.initErrors,
        			function ( error, message ) {

        				errorOutput += message + "\n";
        			}
        		);

        		errorOutput += "\nAborting FrankenKey!";

        		alert( errorOutput );

        		return false;

        	}


        	/**
        	 * Create jQuery dialog boxes for nicer messages and so on
        	 */
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

                            _oldBind( key, function( event, combo ) { frankenkey.keyFetcher( event, combo ); }, args[1] );

                        }

                    }

                    return true;

                };

                return self;

            }) ( Mousetrap );

            Mousetrap.bind( frankenkey.keymap );

        },

        /**
         * initialize jQuery dialog boxes for error messages and settings windows
         */
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
				'<div id="frankenkey-error-confirm" title="'+this.trans.fk_error+'">' +
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
            '    <tr><th>'+this.trans.shortcut+'</th><th>'+this.trans.description+'</th></thead>' +
            '  <tbody>';

            for( var key in this.keymap ) {

            	var action = this.keymap[key];

            	if( null === action || undefined === action ){
            		continue;
            	}

            	var keys = [];
            	var keystr = '';

            	if( 0 < action.desc.length ){

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
    				'<div id="frankenkey-help-confirm" title="'+this.trans.fk_help+'"><p>' +
        			'    <span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 20px 0;"></span>' +
        			html + '</p></div>'
    		);

    		this.help_confirm =	$( '#frankenkey-help-confirm' );

    		confirm_window_options.resizable = true;
    		confirm_window_options.height	 = Math.round( ( window.innerHeight / 4 ) * 3 );
    		confirm_window_options.width	 = 350;

			this.help_confirm.dialog( confirm_window_options );

        },

        /**
         * Keyfetcher is the core component of FrankenKey
         * KeyFetcher observe the keyboard and trigger the actions depending on the current keypress
         * @param event Window event
         * @param combo Keyboardshortcut such as ctrl+b, ctrl+alt+h, etc
         * @returns false to prevent default browser behavior
         */
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

                    var action = this.keymap[combo];
                    var type = action.type;

                    if ( undefined !== type && ( 0 > $.inArray( type, validActions ) ) ) {

                    	action.err = this.trans.action_not_defined.replace( /{type}/, type );
                    	action.type = 'error';

                    }

                    else if( undefined === type ) {

                    	action.err = this.trans.undefined_action;
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

	                    	var msg = this.trans.error_msg.replace( /{keycombo}/, combo );
	                    	this.err_msg.html(  msg + action.err );
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

        /**
         * Wrapping selected text with tags or open a tag if no text is selected.
         * If a tag already was opened, wrapWithTags close the open tag.
         * WORKS ONLY WITH HTML tags!!
         *
         * @param tag Tag which the text will be wrapped with / to open or close
         * @returns boolean Always true
         */
        wrapWithTags: function( tag ) {

                var startTag = '<' + tag + '>';
                var endTag	 = '</' + tag + '>';

                var selection = this.container.getSelection().text;

                if( '' !== selection ) {

                        this.container.wrapSelection( startTag, endTag );

                } else {

                        if( true !== this.openTags[tag] ) {

                                this.openTags[tag] = true;

                                this.container.insertAtCaret( startTag );

                        } else {

                                this.openTags[tag] = false;

                                this.container.insertAtCaret( endTag );

                        }

                }

                return true;

        },

        /**
         * Trigger a click on a button, link, etc
         *
         * @param button_id HTML ID of the element which should be clicked
         */
        clickButton: function( button_id ){

        	$( document ).find( button_id ).trigger( 'click' );

        },

        /**
         * Helper function to open the help window
         * @returns boolean Always true
         */
        help: function() {

                this.help_confirm.dialog( 'open' );

                return true;
        }


	}; // end FrankenKey

FrankenKey.init();



var FrankenKeyFinder = {

	/**
	 * Flag if the object is already initialized
	 */
	fkfInit: null,

	/**
	 * Reference to FrankenKey.keymap
	 */
	fkKeymap: null,

	/**
	 * Container for translated strings
	 */
	trans: null,

	/**
	 * Container for keymap
	 */
	buttonKeymap: [],

	settingsTB: $( '#frankenkey_toolbar_shortcuts' ),
	settingsPB: $( '#frankenkey_pagebuttons_shortcuts' ),

	settingsTBWindow: null,
	settingsPBWindow: null,

	nonce_name: 'frankenkey_nonce',

	doc: $( document ),

	init: function () {

		this.fkKeymap = ( undefined !== FrankenKey.keymap ) ?
			FrankenKey.keymap : null;

		// bail if FrankenKey.keymap is not defined
		if( null !== this.fkKeymap ){
			this.fkfInit = true;
		} else {
			return false;
		}

		// get translation
    	this.trans = ( undefined !== FrankenKeyTranslation ) ?
       		FrankenKeyTranslation : null;

		var bkeymap = this.buttonKeymap;

		$.each( this.fkKeymap,

			function ( keycombo, args ) {

				if( null === args || undefined === args ){
					return false;
				}

				type = ( undefined !== args.type ) ?
					args.type : '';

				id = ( undefined !== args.id ) ?
					args.id : '';

				desc = ( undefined !== args.desc ) ?
					args.desc : '';

				if( 'button' === type && '' !== id ){

					bkeymap[id] = { 'id': id, 'keycombo': keycombo, 'desc': desc };

				}

				return true;
			}
		);

	},

	findTBButtons: function ( id, element ) {

		if( null === this.fkfInit ){
			this.init();
		}

		// wait until the buttons in the toolbar are inserted by another jscript
		var me = this;
		var interval = null;

		interval = window.setInterval(
			function () {

				var length = $( id ).find( element ).length;

				if( 0 < length ){
					window.clearInterval( interval );
					me._findTBButtons( id, element );
				}
			},
			500
		);

	},

	_findTBButtons: function( id, element ) {

		var me = this;
		var keymap = this.buttonKeymap;

		var table =
			'<table border="1" style="border:1px solid black; border-collapse:collapse">'+
			'  <thead>'+
			'    {thead}'+
			'  </thead>'+
			'  <tbody>'+
			'    {tbody}'+
			'  </tbody>'+
			'</table>';

		var thead =
			'  <tr>'+
			'    <th>'+this.trans.button+'</th>'+
			'    <th>'+this.trans.shortcut+'</th>'+
			'    <th>'+this.trans.description+'</th>'+
			'    <th colspan="2">'+this.trans.action+'</th>'+
			'  </tr>';

		var trow =
			'  <tr class="frankenkey-tbkeys">'+
			'    <td>{val}<input type="hidden" class="fk-button-id" value="{id}"></td>'+
			'    <td><input type="text" size="10" class="fk-keycombo" value="{keycombo}"></td>'+
			'    <td><input type="text" size="30" class="fk-button-desc" value="{desc}">'+
			'    <td><input type="button" class="button fk-save-keycombo" value="'+this.trans.save+'"></td>'+
			'    <td><input type="button" class="button fk-del-keycombo" value="'+this.trans.del+'"></td>'+
			'  </tr>';

		var tbody = '';

		this.doc.find( id + ' ' + element + ':visible' ).each(

			function ( index ) {

				var elem = $( this );
				var row = trow;

				var id = '#'+elem.attr( 'id' );
				var val = elem.val();

				args = ( undefined !== keymap[id] ) ?
					keymap[id] : {};

				keycombo = ( undefined !== args.keycombo ) ?
					args.keycombo : '';

				desc = ( undefined !== args.desc ) ?
					args.desc : '';


				row = row.replace( /{index}/, index );
				row = row.replace( /{id}/, id );
				row = row.replace( /{val}/, val );
				row = row.replace( /{keycombo}/, keycombo );
				row = row.replace( /{desc}/, desc );

				tbody += row;
			}

		);

		table = table.replace( /{thead}/, thead );
		table = table.replace( /{tbody}/g, tbody );

		html = this.settingsTB.html();

    	this.settingsTB.html(
    			html +
				'<div id="fk-settings" title="'+this.trans.fk_settings+'">' +
				table +
				'<p>' + this.trans.settings_msg_1 + '<br><strong>' + this.trans.settings_msg_2 + '</strong></p>'+
				'</div>'
		);


		this.settingsWindow = $( '#fk-settings' );

		this.settingsWindow.dialog(
			{

				resizable:	true,
				height:		Math.round( ( window.innerHeight / 4 ) * 3 ),
				width:		550,
				hide:		true,
				modal:		false,
				autoOpen:	false,
				buttons:	{
					Ok:		function () { $( this ).dialog( "close" ); window.location.reload(); },
					Cancel:	function () { $( this ).dialog( "close" ); }
				}

	    	}
		);


		// register mouseevents
		$( '.frankenkey-tbkeys' ).hover(
			function () { me.markButton( this, 'mark' ); },
			function () { me.markButton( this, 'unmark' ); }
		);

		$( '.fk-save-keycombo' ).click(
			function () { me.saveKeycombo( this, false ); }
		);

		$( '.fk-del-keycombo' ).click(
			function () { me.delKeycombo( this ); }
		);

		$( '.fk-tb-settings-open' ).click(
			function () { me.settingsWindow.dialog( 'open' ); }
		);


	},

	findPageButtons: function ( id, elements ) {

	},

	saveKeycombo: function ( element, extraData ) {

		var me = this;

		var nonce = $( '#'+me.nonce_name ).val();
		var row = $( element ).parent().parent();

		var type = 'button';

		var data = {
			'action':		'frankenkey_save_keycombo',
			'fk-keycombo':	row.find( '.fk-keycombo' ).val(),
			'fk-type':		type,
			'fk-id':		row.find( '.fk-button-id' ).val(),
			'fk-desc':		row.find( '.fk-button-desc' ).val()
		};

		data[me.nonce_name] = nonce;

		if( false !== extraData ){
			$.each( extraData,
				function ( key, value ) {
					data[key] = value;
				}
			);
		}

		$.post(
				ajaxurl,
				data,
				function ( response ) {

					if( 1 !== parseInt( response, 10 ) ){
						alert( me.trans.error_saving_keycombo );
					} else {
						var ease = 'all 1s ease';

						row
						   .css( '-webkit-transition', ease )
					       .css( 'backgroundColor', 'transparent' )
					       .css( '-moz-transition', ease )
					       .css( '-o-transition', ease )
					       .css( '-ms-transition', ease )
					       .css( 'backgroundColor', '#33CC00' ).delay( 900 ).queue(
					    		 function() {
					    			 $( this ).css( 'backgroundColor', 'transparent' );
					    			 $( this ).dequeue();
					             }
					    	);

					}

				}
		);

		return true;

	},

	delKeycombo: function ( element ) {

		var me = this;

		var row = $( element ).parent().parent();

		row.find( '.fk-keycombo' ).val( '' );
		row.find( '.fk-button-desc' ).val( '' );

		var extraData = { 'delete': true };

		me.saveKeycombo( element, extraData );

		return true;

	},

	markButton: function ( element, mode ) {

		var id = $( element ).find( 'input' ).val();
		var button = this.doc.find( id );

		switch( mode ){

			case 'mark':

				// correct width
				var width = parseInt( button.css( 'width' ), 10 );
				width -= 11;
				width += 'px';

				var height = parseInt( button.css( 'height' ), 10 );
				height -= 3;
				height += 'px';

				var top = 0;
				var left = 0;

				if( undefined !== button.position() ){
					top = button.position().top;
					left = button.position().left;
				}

				var css = {
					'width': width,
					'height': height,
					'position': 'absolute',
					'top': top+'px',
					'left': left+'px',
					'background-color': 'red',
					'opacity': '0.5',
					'border': '3px solid black',
					'border-radius': '5px'
				};

				button.after(
					'<div id="frankenkey-button-overlay"></div>'
				);

				overlay = $( '#frankenkey-button-overlay' );
				$.each( css, function ( key, val ) { overlay.css( key, val ); } );

			break;

			case 'unmark':
			default:

				this.doc.find( '#frankenkey-button-overlay' ).remove();

			break;

		}

		return true;

	}

};

FrankenKeyFinder.findTBButtons( '#ed_toolbar', 'input' );


}); // end jQuery( document ).ready()