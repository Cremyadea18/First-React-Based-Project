<?php
get_header();

while ( have_posts() ) : the_post();
    global $product;
    
    $react_data = [
        'id'          => get_the_ID(),
        'titulo'      => get_the_title(),
        'precio'      => $product->get_price_html(),
        'descripcion' => apply_filters( 'the_content', get_the_content() ),
        'imagen'      => get_the_post_thumbnail_url(get_the_ID(), 'large'),
        'stock'       => $product->get_stock_quantity(),
        'nonce'       => wp_create_nonce( 'wc_store_api' ) 
    ];
    ?>

    <style>
        /* CSS enfocado SOLO en el contenedor de PayPal */
        .product_template_container [id^="ppc-button-"], 
        .product_template_container .paypal-button-container {
            width: 100% !important;
            max-width: 400px !important; 
            margin: 20px 0 !important;
            display: block !important;
        }

        /* Eliminamos cualquier estilo que altere los productos relacionados */
    </style>

    <div class="product_template_container">
        <div id="react-single-product-root" 
             data-product="<?php echo esc_attr( json_encode( $react_data ) ); ?>">
        </div>

        <div class="related-products-container" style="margin-top: 80px; padding: 40px;">
            <?php woocommerce_output_related_products(); ?>
        </div>
    </div>

    <script>
        // Versión mejorada del script: Forzamos la configuración global de PayPal
        (function($) {
            $(document).on('wc_paypal_payments_buttons_init', function(event, config) {
                if (config && config.style) {
                    config.style.color = 'silver';
                    config.style.shape = 'rect';
                    config.style.layout = 'vertical';
                }
            });
        })(window.jQuery);
    </script>

    <?php
endwhile;

wp_reset_postdata();
get_footer();
?>