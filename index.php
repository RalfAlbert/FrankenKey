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
 * Version: 	0.3
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

add_action( 'plugins_loaded', 'frankenkey_starter', 10, 0 );

function frankenkey_starter(){

	add_action(
		'admin_print_scripts-post-new.php',
		'frankenkey_enqueue_javascript',
		10,
		0
	);

	add_action(
		'admin_print_scripts-post.php',
		'frankenkey_enqueue_javascript',
		10,
		0
	);

	add_action(
		'admin_print_styles',
		'frankenkey_styles',
		10,
		0
	);

}

function frankenkey_enqueue_javascript(){

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

}

function frankenkey_styles(){

	wp_enqueue_style(
		'frankenkey-dialog',
		plugins_url( 'css/jquery-ui-dialog.css', __FILE__ ),
		false,
		false,
		'screen'
	);
}