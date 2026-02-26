<?php
get_header();

while ( have_posts() ) : the_post();
    global $product;
    
    
    $raw_price = $product->get_price(); 

    $react_data = [
        'id'          => get_the_ID(),
        'titulo'      => get_the_title(),
        'precio'      => $product->get_price_html(),
        'raw_price'   => $raw_price, 
        'descripcion' => apply_filters( 'the_content', get_the_content() ),
        'imagen'      => get_the_post_thumbnail_url(get_the_ID(), 'large'),
        'stock'       => $product->get_stock_quantity(),
        'nonce'       => wp_create_nonce( 'wc_store_api' ) 
    ];
    ?>

    <div class="product_template_container">
        <div id="react-single-product-root" 
             data-product="<?php echo esc_attr( json_encode( $react_data ) ); ?>">
             <p style="text-align:center; color: white;">Cargando experiencia de producto...</p>
        </div>

    <div class="related-products-container">
    <h2 class="my-custom-related-title">Continue Shopping</h2>
    
    <?php woocommerce_output_related_products(); ?>
</div>
    </div>

    <?php
endwhile;

wp_reset_postdata();
get_footer();
?>