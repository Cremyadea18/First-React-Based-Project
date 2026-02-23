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
 * 5. CONVERSIÓN MAESTRA E INDEPENDIENTE (SIN PLUGINS)
 */

// 1. Detectamos la moneda en la URL y la seteamos globalmente para la sesión API
add_action('init', function() {
    if (isset($_GET['currency'])) {
        $requested_currency = strtoupper(sanitize_text_field($_GET['currency']));
        
        // Forzamos a WooCommerce a creer que esta es la moneda de la tienda
        add_filter('woocommerce_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 9999);
    }
});

// 2. Interceptamos el objeto del producto antes de enviarlo a React
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    // Si no hay moneda o es USD, enviamos el precio original
    if (!$currency || strtoupper($currency) === 'USD') {
        return $response;
    }

    $to_curr = strtoupper($currency);
    $data = $response->get_data();

    // --- TU TABLA DE CONVERSIÓN MANUAL ---
    $rates = [
        'COP' => 3996.25,
        'EUR' => 0.84,
        'MXN' => 17.10
    ];

    $rate = isset($rates[$to_curr]) ? $rates[$to_curr] : 1;

    // Convertimos los valores
    // Usamos el precio original del objeto $product para evitar multiplicaciones previas
    $original_price = $product->get_regular_price();
    $original_sale  = $product->get_sale_price();
    
    if ($original_price) {
        $data['regular_price'] = (string)round($original_price * $rate, 2);
    }
    
    if ($original_sale) {
        $data['sale_price'] = (string)round($original_sale * $rate, 2);
        $data['price']      = $data['sale_price'];
    } else {
        $data['price']      = $data['regular_price'];
    }

    // Actualizamos la respuesta
    $response->set_data($data);
    return $response;
}, 9999, 3);