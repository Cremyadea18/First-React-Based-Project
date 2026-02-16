<?php get_header(); ?>

<main id="primary" class="site-main">
    <?php
    if ( have_posts() ) :
        while ( have_posts() ) :
            the_post();
            
        endwhile;
    else :
        echo '<p>No se encontró contenido.</p>';
    endif;
    ?>
</main>

<?php get_footer(); ?>