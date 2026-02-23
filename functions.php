<?php

/**
 * 1. Encolado de scripts y estilos de React
 */
function enqueue_react_app_custom() {
    $theme_uri = get_template_directory_uri();
    $version = time(); 

    if ( is_page() || is_page_template('template-react.php') || is_product() ) {
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            $version, 
            true 
        );
    }
    
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), $version);
}
add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

/**
 * 2. Soporte para módulos de JS (Vite/React)
 */
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" crossorigin src="' . esc_url($src) . '"></script>';
}, 10, 3);

/**
 * 3. Permisos públicos para lectura de productos vía REST API
 */
add_filter( 'woocommerce_rest_check_permissions', function( $permission, $context, $object_id, $post_type ) {
    if ( $post_type === 'product' && $context === 'read' ) {
        return true;
    }
    return $permission;
}, 10, 4 );

/**
 * 4. Soporte base de WooCommerce
 */
function mytheme_add_woocommerce_support() {
    add_theme_support( 'woocommerce' );
}
add_action( 'after_setup_theme', 'mytheme_add_woocommerce_support' );

/**
 * 5. CAMPO PERSONALIZADO DE PRECIO PARA REACT (SOLUCIÓN ATÓMICA)
 */
add_action('rest_api_init', function() {
    register_rest_field('product', 'precio_limpio', array(
        'get_callback' => function($product_data, $field_name, $request) {
            $product = wc_get_product($product_data['id']);
            $currency = $request->get_param('currency') ?: 'USD';
            $to_curr = strtoupper(sanitize_text_field($currency));
            
            // Valor base en USD (limpio de la DB)
            $base_price = (float)$product->get_regular_price();
            $sale_price = (float)$product->get_sale_price();
            $current_price = $sale_price > 0 ? $sale_price : $base_price;

            // Tabla de conversión manual (100% controlada por ti)
            $rates = [
                'USD' => 1,
                'COP' => 3996.25,
                'EUR' => 0.84
            ];

            $rate = isset($rates[$to_curr]) ? $rates[$to_curr] : 1;
            
            return [
                'monto' => round($current_price * $rate, 2),
                'moneda' => $to_curr,
                'simbolo' => ($to_curr === 'COP' ? 'COP$ ' : ($to_curr === 'EUR' ? '€' : '$'))
            ];
        },
        'update_callback' => null,
        'schema'          => null,
    ));
});