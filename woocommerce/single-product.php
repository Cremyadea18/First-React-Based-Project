<?php
/**
 * DIAGNÓSTICO EXTREMO
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header(); 

echo '<h1 style="color: red; text-align: center; background: yellow; padding: 20px; position: relative; z-index: 9999;">
        SI VES ESTO, LA PLANTILLA ESTÁ CARGANDO
      </h1>';

if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        global $product;
        
        // Verificamos si el objeto producto existe
        if ( is_object( $product ) ) {
            echo '<h2 style="text-align:center;">Producto detectado: ' . get_the_title() . '</h2>';
        } else {
            echo '<h2 style="text-align:center; color: orange;">Error: El objeto $product no se cargó correctamente.</h2>';
        }

        // Mostrar el contenido básico
        echo '<div style="max-width:800px; margin: 0 auto; border: 2px solid blue; padding: 20px;">';
        the_title('<h1>', '</h1>');
        the_content();
        echo '</div>';

    endwhile;
else :
    echo '<h2 style="text-align:center; color: red;">ERROR: WordPress no encontró el post del producto.</h2>';
endif;

get_footer();