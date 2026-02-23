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
        /* Ajustes visuales para el contenedor de PayPal */
        .product_template_container [id^="ppc-button-"], 
        .product_template_container .paypal-button-container {
            width: 100% !important;
            max-width: 450px !important; /* Un poco más ancho para que luzca el color silver */
            margin: 30px 0 !important; /* Más espacio arriba y abajo */
            display: block !important;
        }

        /* Centrado opcional: si tu diseño es centrado, descomenta la siguiente línea */
        /* .paypal-button-container { margin-left: auto !important; margin-right: auto !important; } */

        .related-products-container {
            border-top: 1px solid #eee;
            background-color: #f9f9f9;
        }
    </style>

    <div class="product_template_container">
        <div id="react-single-product-root" 
             data-product="<?php echo esc_attr( json_encode( $react_data ) ); ?>">
        </div>

        <div class="related-products-container" style="margin-top: 80px; padding: 60px 40px;">
            <?php woocommerce_output_related_products(); ?>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Escuchamos el evento específico del plugin de PayPal para WooCommerce
            if (window.jQuery) {
                jQuery(document.body).on('wc_paypal_payments_buttons_init', function(event, config) {
                    console.log("🎨 Aplicando estilo Silver al botón de PayPal...");
                    
                    // Sobreescribimos la configuración del SDK de PayPal
                    config.style = {
                        layout: 'vertical',
                        color:  'silver',   // El color plateado que pediste
                        shape:  'rect',     // Forma rectangular moderna
                        label:  'checkout', // Texto del botón
                        height: 45          // Altura balanceada
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