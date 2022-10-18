<?php

function add_styles()
{
  wp_enqueue_style("style", get_stylesheet_uri());
  // enqueue other stylesheets...
}
add_action('wp_enqueue_scripts', 'add_styles');
