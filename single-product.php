<?php
get_header();

while ( have_posts() ) : the_post();
    global $product; // Cargamos el objeto del producto actual
    ?>

    <section class="custom-product-page">
        <div class="container-hibrido">
            
            <div class="product-gallery">
                <?php echo $product->get_image('full'); ?>
            </div>

            <div class="product-details">
                <h1 class="product-title-custom"><?php the_title(); ?></h1>
                
                <div class="product-price-custom">
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
?>