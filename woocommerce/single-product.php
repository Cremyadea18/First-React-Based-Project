<?php
get_header();

while ( have_posts() ) : the_post();
    global $product;
    
    // 1. Agregamos el ID para que React sepa qué producto mandar al carrito
    $react_data = [
        'id'          => get_the_ID(), // <--- MUY IMPORTANTE
        'titulo'      => get_the_title(),
        'precio'      => $product->get_price_html(),
        'descripcion' => apply_filters( 'the_content', get_the_content() ),
        'imagen'      => get_the_post_thumbnail_url(get_the_ID(), 'large'),
        'stock'       => $product->get_stock_quantity(),
    ];
    ?>

    <div class="product_template_container">
        <div id="react-single-product-root" 
             data-product="<?php echo esc_attr( json_encode( $react_data ) ); ?>">
        </div>

        <div class="related-products-container" style="margin-top: 80px; padding: 40px;">
            <?php woocommerce_output_related_products(); ?>
        </div>
    </div>

    <?php
endwhile;

// 2. Limpiamos la data del post por seguridad
wp_reset_postdata();

get_footer();
?>