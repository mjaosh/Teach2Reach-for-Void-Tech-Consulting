<?php 
/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function customize_preview_js() {
    wp_enqueue_script( 'customizer_liveview', get_template_directory_uri() . '/js/customizer-liveview.js', array( 'customize-preview', 'customize-selective-refresh' ), false, true );
}
add_action( 'customize_preview_init', 'customize_preview_js', 65 );

?>
