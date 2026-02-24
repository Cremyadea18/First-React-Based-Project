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
 * 5. INTEGRACIÓN TOTAL CON FOX CURRENCY (WOOCS) PARA LA API
 */

// A. Cambiar la moneda global del sistema al detectar el parámetro en la URL
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        global $WOOCS;
        if ($WOOCS) {
            $WOOCS->set_currency($to_curr);
        }

        // Asegurar que el símbolo sea el correcto
        add_filter('woocommerce_currency_symbol', function($symbol) use ($to_curr) {
            switch($to_curr) {
                case 'EUR': return '€';
                case 'USD': return '$';
                default: return $symbol;
            }
        }, 999);
    }
    return $is_rest_api;
});

// B. Forzar la moneda en la consulta de productos (Especial para el Buscador)
add_filter('woocommerce_rest_product_query', function($args, $request) {
    $currency = $request->get_param('currency');
    if ($currency) {
        global $WOOCS;
        if ($WOOCS) {
            $WOOCS->set_currency(strtoupper(sanitize_text_field($currency)));
        }
    }
    return $args;
}, 999, 2);

/**
 * 6. PREPARACIÓN DE DATOS CONVERTIDOS PARA REACT
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    if ($currency) {
        $data = $response->get_data();
        
        // 1. Convertimos los precios numéricos
        $data['price']          = (string)wc_get_price_to_display($product);
        $data['regular_price']  = (string)wc_get_price_to_display($product, array('price' => $product->get_regular_price()));
        $data['sale_price']     = (string)wc_get_price_to_display($product, array('price' => $product->get_sale_price()));

        // 2. REGENERAMOS EL HTML DEL PRECIO (Vital para el Buscador)
        // Esto hace que el product.price_html que usa tu React ya traiga el símbolo correcto
        $data['price_html'] = $product->get_price_html();

        $response->set_data($data);
    }
    return $response;
}, 999, 3);