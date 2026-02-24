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
 * 5. INTEGRACIÓN FOX + DEBUG LOGS
 */
add_action('init', function() {
    // Detectamos si es una petición de la API
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        global $WOOCS;
        
        // LOG PARA PHP (Ver en error_log del servidor)
        error_log("API REQUEST DETECTED: Moneda solicitada -> " . $to_curr);

        if ($WOOCS) {
            $WOOCS->set_currency($to_curr);
            error_log("FOX: Moneda global establecida a " . $WOOCS->current_currency);
        } else {
            error_log("FOX ERROR: No se encontró la variable global WOOCS");
        }

        add_filter('woocommerce_currency_symbol', function($symbol) use ($to_curr) {
            return ($to_curr === 'EUR') ? '€' : (($to_curr === 'USD') ? '$' : $symbol);
        }, 999);
    }
});

/**
 * 6. PREPARACIÓN DE RESPUESTA + HEADER DE DEBUG
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    if ($currency) {
        $data = $response->get_data();
        
        // Log interno para ver qué precio está calculando WC
        $debug_price = wc_get_price_to_display($product);
        
        $data['price_html'] = $product->get_price_html();
        $data['price'] = (string)$debug_price;
        
        // Inyectamos un campo de debug que verás en el console.log de React
        $data['debug_info'] = [
            'currency_requested' => $currency,
            'current_fox_currency' => isset($GLOBALS['WOOCS']) ? $GLOBALS['WOOCS']->current_currency : 'no_fox',
            'calculated_price' => $debug_price
        ];

        $response->set_data($data);
    }
    return $response;
}, 999, 3);