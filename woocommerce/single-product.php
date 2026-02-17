<?php
get_header();

while ( have_posts() ) : the_post();
    global $product;
    ?>
   <div class= "product_main_container">
<div class="product-single-container">
        <div class="product-layout-grid">
            
            <div class="product-image-wrapper">
                <?php if ( has_post_thumbnail() ) : ?>
                    <?php the_post_thumbnail('large', ['class' => 'main-product-img']); ?>
                <?php endif; ?>
            </div>

            <div class="product-info-wrapper">
                <h1 class="product-main-title"><?php the_title(); ?></h1>
                
                <div class="product-main-price">
                    <?php echo $product->get_price_html(); ?>
                </div>

                <div class="product-main-description">
                    <?php the_content(); ?>
                </div>

                <div class="product-main-action">
                    <?php woocommerce_template_single_add_to_cart(); ?>
                </div>
            </div>

        </div>
    </div>
   </div>
    

    <?php
endwhile;

get_footer();