/**
 * customizer.js
 *
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

( function( $ , api ) {

    /**
     * Handle rendering of partials.
     *
     * @param {api.selectiveRefresh.Placement} placement
     */
    api.selectiveRefresh.bind( 'partial-content-rendered', function( placement ) {
        $( window ).resize();
    } );

    function update_css( ){
         var css_code = $( '#onepress-style-inline-css' ).html();
        // Fix Chrome Lost CSS When resize ??
        $( '#onepress-style-inline-css' ).replaceWith( '<style class="replaced-style" id="onepress-style-inline-css">'+css_code+'</style>' );

    }

    // When preview ready
    wp.customize.bind( 'preview-ready', function() {
        update_css();
    });

    $( window ).resize( function(){
        update_css();
    });


    wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function( settings ) {

        if (  settings.partial.id  == 'onepress-header-section' ) {
            $( document ) .trigger( 'header_view_changed',[ settings.partial.id ] );
        }

        $( document ) .trigger( 'selectiveRefresh-rendered',[ settings.partial.id ] );
    } );


} )( jQuery , wp.customize );

