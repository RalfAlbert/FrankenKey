<?php
/**
 * WordPress-Plugin FrankenKey
 *
 * PHP version 5.2
 *
 * @category   PHP
 * @package    WordPress
 * @subpackage FrankenKey
 * @author     Ralf Albert <me@neun12.de>
 * @license    GPLv3 http://www.gnu.org/licenses/gpl-3.0.txt
 * @version    0.1
 * @link       http://wordpress.com
 */

/**
 * Plugin Name:	Frankenkey
 * Plugin URI:	http://yoda.neun12.de
 * Description:	Adding keyboardshortcuts to the html editor
 * Version: 	0.4
 * Author: 		Ralf Albert
 * Author URI: 	http://yoda.neun12.de
 * Text Domain:
 * Domain Path:
 * Network:
 * License:		GPLv3
 */

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

namespace FrankenKey;

add_action( 'plugins_loaded', 'FrankenKey\plugin_init', 10, 0 );

register_activation_hook( __FILE__, 'FrankenKey\plugin_activation' );
register_deactivation_hook( __FILE__, 'FrankenKey\plugin_uninstall' );
register_uninstall_hook( __FILE__, 'FrankenKey\plugin_uninstall' );

function plugin_init(){

	add_action(
		'wp_ajax_frankenkey_save_keycombo',
		'FrankenKey\save_keycombo'
	);

	foreach( array( 'post.php', 'post-new.php' ) as $page ){

		add_action(
			'admin_print_scripts-' . $page,
			'FrankenKey\enqueue_javascript',
			10,
			1
		);

		add_action(
			'admin_print_styles-' . $page,
			'FrankenKey\enqueue_styles',
			10,
			0
		);

		add_action(
			'admin_bar_menu',
			'FrankenKey\adminbar_menu',
			999
		);

		add_action(
			'load-' . $page,
			'FrankenKey\help_tab',
			10,
			0
		);

	}

}

function plugin_activation(){

	$config = get_config();

	add_option( $config->keymap );

}

function plugin_uninstall(){

	$config = get_config();

	delete_option( $config->keymap );

}

function get_config(){

	$config = new \stdClass();
	$config->options	= 'frankenkey-options';
	$config->keymap		= 'frankenkey-keymap';
	$config->nonce_name	= 'frankenkey_nonce';
	$config->nonce_action_save_keycombo = 'save_keycombo';

	return $config;

}

function get_translation( $what = false ){

	$what = filter_var( $what, FILTER_SANITIZE_STRING );

	$translation = new \stdClass();

	$translation->domain = 'frankenkey';

	$translation->strings = array(

			'help'			=> __( 'Help', $translation->domain ),
			'button'		=> __( 'Button', $translation->domain ),
			'shortcut'		=> __( 'Shortcut', $translation->domain ),
			'description'	=> __( 'Description', $translation->domain ),
			'action'		=> __( 'Action', $translation->domain ),
			'save'			=> __( 'Save', $translation->domain ),
			'del'			=> __( 'Delete', $translation->domain ),
			'fk_error'		=> __( 'FrankenKey Error', $translation->domain ),
			'fk_help'		=> __( 'FrankenKey Help', $translation->domain ),
			'fk_settings'	=> __( 'FrankenKey Settings', $translation->domain ),

			'action_not_defined'	=> __( 'Action <strong>{type}</strong> not defined', $translation->domain ),
			'undefined_action'		=> __( 'Undefined action', $translation->domain ),
			'error_msg'				=> __( 'Shortcut "<strong>{keycombo}</strong>" failed in case of bad shortcut definition.<br>', $translation->domain ),
			'error_saving_keycombo'	=> __( 'Error while saving the shortcut.', $translation->domain ),
			'settings_msg_1'		=> __( 'You can use the metakeys <code>[ctrl]</code>, <code>[shift]</code> and <code>[alt]</code>', $translation->domain ),
			'settings_msg_2'		=> __( 'The page reload automatically after clicking OK!', $translation->domain )
	);

	switch( $what ){

		case 'domain':
			return $translation->domain;
		break;

		case 'strings':
			return $translation->strings;
		break;

		default:
			return $translation;
		break;
	}

}

function get_keymap(){

	$config = get_config();

	$keymap_converted	= array();
	$keymap_database	= get_option( $config->keymap );

	if( empty( $keymap_database ) )
		$keymap_database = array();

	foreach( $keymap_database as $id => $data ){

		$decoded = json_decode( $data, true );
		$keymap_converted[$decoded['keycombo']] = $data;

	}

	return $keymap_converted;

}

function enqueue_javascript(){

	wp_enqueue_script(
		'mousetrap',
		plugins_url( 'js/mousetrap.min.js', __FILE__ ),
		false,
		false,
		true
	);

	wp_enqueue_script(
		'frankenkey-selection-jquery-plugin',
		plugins_url( 'js/selection.js', __FILE__ ),
		array( 'jquery' ),
		false,
		true
	);

	wp_enqueue_script(
		'frankenkey',
		plugins_url( 'js/frankenkey.js', __FILE__ ),
		array( 'jquery', 'jquery-ui-dialog', 'mousetrap', 'frankenkey-selection-jquery-plugin' ),
		false,
		true
	);

// 	wp_enqueue_script(
// 		'test-jquery-plugin',
// 		plugins_url( 'js/test.js', __FILE__ ),
// 		array( 'jquery', 'frankenkey' ),
// 		false,
// 		true
// 	);

	$translation = get_translation();

	wp_localize_script( 'frankenkey', 'FrankenKeyTranslation', $translation->strings );

	$keymap = get_keymap();

	wp_localize_script( 'frankenkey', 'FrankenKeyKeymap', $keymap );

}

function enqueue_styles(){

	wp_enqueue_style(
		'frankenkey-dialog',
		plugins_url( 'css/jquery-ui-dialog.css', __FILE__ ),
		false,
		false,
		'screen'
	);
}

function adminbar_menu(){

	global $wp_admin_bar;

	$config = get_config();

	$textdomain = get_translation( 'domain' );

	$screen = get_current_screen();

	if( ! is_admin_bar_showing() || 'post' != $screen->base )
		return;

	$content = '<div id="frankenkey_{what}_shortcuts">' . wp_nonce_field( $config->nonce_action_save_keycombo, $config->nonce_name, false, false ) . '</div>';

	$wp_admin_bar->add_menu(
		array(
				'id' => 'frankenkey',
				'title' => __( 'Frankenkey', $textdomain ),
				'href' => false
		)
	);

	$wp_admin_bar->add_menu(
			array(
					'id'	=> 'frankenkey_toolbar_content',
					'parent' => 'frankenkey',
					'title' => __( 'Editor Toolbar Buttons', $textdomain ) . str_replace( '{what}', 'toolbar', $content ),
					'href' => '#',
					'meta' => array(
							'class' => 'fk-tb-settings-open',
							'onclick' => 'return false;'
							)
			)
	);

	$wp_admin_bar->add_menu(
			array(
					'id'	=> 'frankenkey_pagebuttons_content',
					'parent' => 'frankenkey',
					'title' => __( 'Page Buttons', $textdomain ) . str_replace( '{what}', 'pagebuttons', $content ),
					'href' => '#',
					'meta' => array(
							'class' => 'fk-pb-settings-open',
							'onclick' => 'return false;'
							)
			)
	);

}

function help_tab(){

	$screen = get_current_screen();

	$screen->add_help_tab( array(
			'id'		=> 'frankenkey',
			'title'		=> 'FrankenKey',
			'content'	=> '<h3>FrankenKey</h3>',
			'callback'	=> 'FrankenKey\help_content'
	) );

}

function help_content(){

	echo '<div id="frankenkey_help_tab">Some usefull help.</div>';

}

function save_keycombo(){

	$config = get_config();

	$nonce_name	= filter_input( INPUT_POST, $config->nonce_name, FILTER_SANITIZE_STRING );

	if ( empty( $_POST ) || ! wp_verify_nonce( $nonce_name, $config->nonce_action_save_keycombo ) )
		die( 'Uh! Oh! Not allowed!' );

	global $wpdb;

	$config	= get_config();
	$keymap	= get_option( $config->keymap );

	if( empty( $keymap ) )
		$keymap = array();

	$values = array();

	$values['keycombo']	= filter_input( INPUT_POST, 'fk-keycombo', FILTER_SANITIZE_STRING );
	$values['type']		= filter_input( INPUT_POST, 'fk-type', FILTER_SANITIZE_STRING );
	$values['id']		= filter_input( INPUT_POST, 'fk-id', FILTER_SANITIZE_STRING );
	$values['desc']		= filter_input( INPUT_POST, 'fk-desc', FILTER_SANITIZE_STRING );
	// all shortcuts are in lowercase!
	$values['keycombo']	= strtolower( $values['keycombo'] );

	if( isset( $_POST['delete'] ) && true === (bool) $_POST['delete'] ){

		if( isset( $keymap[$values['id']] ) )
			unset( $keymap[$values['id']] );

	} else {

		$keymap[$values['id']] = json_encode( $values );

	}

	update_option( $config->keymap, $keymap );

	die( true );

}

