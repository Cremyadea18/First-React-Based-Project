<?php
get_header();

while ( have_posts() ) : the_post();
    global $product;
    
    // Obtenemos la moneda actual para que el precio inicial sea coherente
    // Pero recuerda que React deberá refrescar esto si el usuario cambia la moneda
    $current_currency = isset($_GET['currency']) ? $_GET['currency'] : (isset($_COOKIE['store_currency']) ? $_COOKIE['store_currency'] : 'USD');

    $react_data = [
        'id'          => get_the_ID(),
        'titulo'      => get_the_title(),
        // Pasamos el precio limpio (numérico) para que React pueda multiplicarlo si es necesario
        'precio_raw'  => $product->get_price(), 
        'precio_html' => $product->get_price_html(), // Este es el que se ve al inicio
        'descripcion' => apply_filters( 'the_content', get_the_content() ),
        'imagen'      => get_the_post_thumbnail_url(get_the_ID(), 'large'),
        'stock'       => $product->get_stock_quantity(),
        'nonce'       => wp_create_nonce( 'wc_store_api' ) 
    ];
    ?>

    <div class="product_template_container">
        <div id="react-single-product-root" 
             data-currency="<?php echo esc_attr($current_currency); ?>"
             data-product="<?php echo esc_attr( json_encode( $react_data ) ); ?>">
        </div>

        <div class="related-products-container" style="margin-top: 80px; padding: 40px;">
            <?php woocommerce_output_related_products(); ?>
        </div>
    </div>

    <?php
endwhile;

wp_reset_postdata();
get_footer();
?>