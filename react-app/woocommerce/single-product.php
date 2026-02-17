<?php
get_header();

// --- BANNER DE CONFIRMACIÓN (BORRAR DESPUÉS) ---
echo '<div style="background: #ff5722; color: white; text-align: center; padding: 20px; font-size: 24px; font-weight: bold; position: relative; z-index: 9999;">
        🚀 ¡ESTÁS USANDO TU PLANTILLA PERSONALIZADA!
      </div>';
// ----------------------------------------------

while ( have_posts() ) : the_post();

    global $product; // Cargamos el objeto del producto actual
    ?>

    <section class="custom-product-page">
        <div class="container-hibrido" style="display: flex; gap: 40px; padding: 50px;">
            
            <div class="product-gallery" style="flex: 1;">
                <?php echo $product->get_image('full'); ?>
            </div>

            <div class="product-details" style="flex: 1;">
                <h1 class="product-title-custom"><?php the_title(); ?></h1>
                
                <div class="product-price-custom" style="font-size: 2rem; color: #646cff; margin-bottom: 20px;">
                    <?php echo $product->get_price_html(); ?>
                </div>

                <div class="product-description-custom">
                    <?php the_content(); ?>
                </div>

                <div class="product-action-custom">
                    <?php woocommerce_template_single_add_to_cart(); ?>
                </div>
            </div>

        </div>
    </section>

    <?php
endwhile;

get_footer();