<?php
get_header();

if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        
        wc_get_template_part( 'content', 'single-product' );
    endwhile;
endif;

get_footer(); 
?>