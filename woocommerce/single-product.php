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
        /* Contenedor de PayPal: Forzamos el ancho para que no se vea desproporcionado */
        .product_template_container [id^="ppc-button-"], 
        .product_template_container .paypal-button-container {
            max-width: 400px !important; /* Ajusta según el ancho de tu botón de carrito */
            margin: 20px 0 !important;
        }

        /* Si el botón es amarillo y lo quieres ocultar hasta que React lo maneje */
        /* .paypal-buttons-loader { display: none; } */
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
        // Intentamos interceptar la configuración del botón antes de que se renderice
        document.addEventListener('DOMContentLoaded', function() {
            if (window.jQuery) {
                jQuery(document.body).on('wc_paypal_payments_buttons_init', function(event, config) {
                    console.log("🛠️ PayPal Config detectada, forzando estilos negros...");
                    config.style = {
                        layout: 'vertical',
                        color:  'black',
                        shape:  'rect',
                        label:  'checkout',
                        height: 45
                    };
                });
            }
        });
    </script>

    <?php
endwhile;

wp_reset_postdata();

get_footer();
?>