<?php
/**
 * Plantilla personalizada para producto individual
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Seguridad: No permitir acceso directo al archivo
}

get_header(); 

// Banner de prueba para confirmar que carga
echo '<div style="background: #4CAF50; color: white; text-align: center; padding: 15px;">🚀 Plantilla Personalizada Activa</div>';

if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        
        // Es vital cargar la variable global $product dentro del loop
        global $product;

        // Si por alguna razón el objeto producto no carga, evitamos que la página rompa
        if ( ! is_object( $product ) ) {
            $product = wc_get_product( get_the_ID() );
        }
        ?>

        <section class="custom-product-page" style="padding: 40px 0;">
            <div class="container-hibrido" style="max-width: 1200px; margin: 0 auto; display: flex; gap: 40px;">
                
                <div class="product-gallery" style="flex: 1;">
                    <?php 
                    if ( has_post_thumbnail() ) {
                        the_post_thumbnail( 'large', array( 'style' => 'width:100%; height:auto; border-radius:15px;' ) ); 
                    }
                    ?>
                </div>

                <div class="product-details" style="flex: 1;">
                    <h1 class="product-title-custom"><?php the_title(); ?></h1>
                    
                    <div class="product-price-custom" style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                        <?php echo $product->get_price_html(); ?>
                    </div>

                    <div class="product-description-custom" style="margin-bottom: 30px;">
                        <?php the_content(); ?>
                    </div>

                    <div class="product-action-custom">
                        <?php 
                        // Esta función es sagrada: renderiza el botón de carrito y variaciones
                        woocommerce_template_single_add_to_cart(); 
                        ?>
                    </div>
                </div>

            </div>
        </section>

        <?php
    endwhile;
endif;

get_footer(); 
?>