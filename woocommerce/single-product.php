<?php
/**
 * Plantilla de prueba simplificada
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Salir si se accede directamente
}

get_header(); ?>

<div style="background: #4CAF50; color: white; padding: 50px; text-align: center;">
    <h1>✅ ¡CONEXIÓN EXITOSA!</h1>
    <p>Si ves este cuadro verde, WordPress está leyendo correctamente el archivo en la carpeta /woocommerce/</p>
</div>

<?php
while ( have_posts() ) : the_post();
    the_title('<h1>', '</h1>');
    the_content();
endwhile;

get_footer(); ?>