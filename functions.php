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
 * 5. CONVERSIÓN TOTAL PARA LA API (ABSOLUTA)
 */

// Esta función maneja la conversión real
function apply_currency_conversion_logic($price, $currency_param) {
    if (!$price || !is_numeric($price)) return $price;
    
    $to_curr = strtoupper(sanitize_text_field($currency_param));
    if ($to_curr === 'USD') return $price;

    $rate = 3996.25; // Tasa base COP
    if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
        $r = \YayCurrency\Internal\Helpers\CurrencyHelper::get_rate($to_curr);
        if ($r) $rate = $r;
    }

    return (float)$price * (float)$rate;
}

// 1. Afectamos los datos crudos del producto en cualquier JSON de la API
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    if (!$currency) return $response;

    $data = $response->get_data();
    
    // Convertimos los campos principales
    $data['price']          = (string)apply_currency_conversion_logic($data['price'], $currency);
    $data['regular_price']  = (string)apply_currency_conversion_logic($data['regular_price'], $currency);
    $data['sale_price']     = (string)apply_currency_conversion_logic($data['sale_price'], $currency);
    
    $response->set_data($data);
    return $response;
}, 999, 3);

// 2. IMPORTANTE: Forzamos el símbolo y la moneda global para la API
add_action('init', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        add_filter('woocommerce_currency', function() use ($to_curr) {
            return $to_curr;
        }, 999);

        add_filter('woocommerce_currency_symbol', function($symbol) use ($to_curr) {
            switch($to_curr) {
                case 'COP': return 'COP$ ';
                case 'EUR': return '€';
                default: return '$';
            }
        }, 999);
    }
});