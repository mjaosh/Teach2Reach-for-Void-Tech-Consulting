<?php
/**
 * Load Controls Files and makes js work
 */
require_once get_template_directory(  ).'/inc/class.php';

function customizer_control_scripts(){
    wp_enqueue_media();
    wp_enqueue_script( 'jquery-ui-sortable' );
    wp_enqueue_script( 'wp-color-picker' );
    wp_enqueue_style( 'wp-color-picker' );

    wp_enqueue_script( 'repeat-customizer', get_template_directory_uri() . '/js/customizer.js', array( 'customize-controls', 'wp-color-picker' ), time() );
}

add_action( 'customize_controls_enqueue_scripts', 'customizer_control_scripts', 99 );
