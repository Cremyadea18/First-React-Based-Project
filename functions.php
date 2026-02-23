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
 * 2. Soporte para modulos de JS (Vite/React)
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
 * 5. 🔥 CORRECCIÓN FINAL: Forzar moneda Y CONVERSIÓN de precios en la API REST
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $requested_currency = strtoupper(sanitize_text_field($_GET['currency']));
        
        // A. Cambiamos la moneda global del sistema
        add_filter('woocommerce_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 999);
        
        // B. Forzamos a YayCurrency a reconocer la moneda de la URL
        add_filter('yay_currency_get_current_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 999);

        // C. FORZAMOS LA CONVERSIÓN DEL PRECIO NUMÉRICO
        // Este filtro intercepta el HTML del precio y lo recalcula con la tasa de cambio
        add_filter('woocommerce_get_price_html', function($price_html, $product) use ($requested_currency) {
            // Intentamos obtener la instancia de YayCurrency para convertir el valor
            if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
                $price = $product->get_price();
                $converted_price = \YayCurrency\Internal\Helpers\CurrencyHelper::convert_price($price, $requested_currency);
                return wc_price($converted_price, array('currency' => $requested_currency));
            }
            return $price_html;
        }, 999, 2);

        // D. Sincronizamos los símbolos
        add_filter('woocommerce_currency_symbol', function($symbol) use ($requested_currency) {
            switch($requested_currency) {
                case 'COP': return 'COP$ ';
                case 'EUR': return '€';
                case 'USD': return '$';
                default: return $symbol;
            }
        }, 999);
    }
    return $is_rest_api;
});

// Extra: Forzar sesión de moneda para evitar que WC ignore el cambio tras el renderizado inicial
add_action('wp_loaded', function() {
    if (isset($_GET['currency'])) {
        $curr = strtoupper(sanitize_text_field($_GET['currency']));
        if (class_exists('WooCommerce') && WC()->session) {
            WC()->session->set('client_currency', $curr);
        }
    }
});