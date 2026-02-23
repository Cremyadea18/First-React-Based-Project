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
 * 5. 🔥 CORRECCIÓN CRÍTICA: Forzar moneda en la API REST
 * Este bloque detecta el parámetro &currency= de React y obliga a WC a responder en esa moneda.
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $requested_currency = strtoupper(sanitize_text_field($_GET['currency']));
        
        // Forzamos la moneda global para la respuesta de la API
        add_filter('woocommerce_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 999);
        
        // Compatibilidad con YayCurrency si está instalado
        add_filter('yay_currency_get_current_currency', function() use ($requested_currency) {
            return $requested_currency;
        }, 999);

        // Forzamos el símbolo correcto para evitar que envíe el de USD ($) siempre
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