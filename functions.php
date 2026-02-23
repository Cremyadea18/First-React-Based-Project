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
 * 5. 🔥 CORRECCIÓN DEFINITIVA: Forzar conversión matemática de precios
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $requested_currency = strtoupper(sanitize_text_field($_GET['currency']));
        
        // 1. Cambiamos la moneda base de la tienda para esta petición
        add_filter('woocommerce_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 999);

        // 2. FORZAR CONVERSIÓN DE VALORES
        // Si el precio viene de la base de datos, lo interceptamos y lo multiplicamos
        // por la tasa de cambio de YayCurrency
        add_filter('woocommerce_product_get_price', 'convert_api_price', 999, 2);
        add_filter('woocommerce_product_get_regular_price', 'convert_api_price', 999, 2);
        add_filter('woocommerce_product_get_sale_price', 'convert_api_price', 999, 2);

        function convert_api_price($price, $product) {
            if (isset($_GET['currency']) && !empty($price)) {
                $to_currency = strtoupper(sanitize_text_field($_GET['currency']));
                
                // Intentamos usar la función de conversión de YayCurrency
                // Si la función anterior falló, usamos el método dinámico de filtros
                if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
                    return \YayCurrency\Internal\Helpers\CurrencyHelper::convert_price($price, $to_currency);
                }
                
                // Alternativa: Si YayCurrency usa filtros de WooCommerce
                return apply_filters('raw_woocommerce_price', $price);
            }
            return $price;
        }

        // 3. Sincronizar Símbolos
        add_filter('woocommerce_currency_symbol', function($symbol) use ($requested_currency) {
            switch($requested_currency) {
                case 'COP': return 'COP$ ';
                case 'EUR': return '€';
                default: return '$';
            }
        }, 999);
    }
    return $is_rest_api;
});