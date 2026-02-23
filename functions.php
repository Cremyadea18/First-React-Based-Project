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
 * 5. CONVERSIÓN DINÁMICA PARA LA REST API
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        add_filter('woocommerce_currency', function() use ($to_curr) {
            return $to_curr;
        }, 999);

        $convert_logic = function($price) use ($to_curr) {
            if (empty($price) || !is_numeric($price)) return $price; 
            if ($to_curr === 'USD') return $price;

            $rate = 1;
            if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
                $rate = \YayCurrency\Internal\Helpers\CurrencyHelper::get_rate($to_curr);
            }

            if (!$rate || $rate == 1) {
                $manual_rates = [
                    'COP' => 3996.25,
                    'EUR' => 0.8468
                ];
                $rate = isset($manual_rates[$to_curr]) ? $manual_rates[$to_curr] : 1;
            }

            return (float)$price * (float)$rate;
        };

        add_filter('woocommerce_product_get_price', $convert_logic, 999);
        add_filter('woocommerce_product_get_regular_price', $convert_logic, 999);
        add_filter('woocommerce_product_get_sale_price', $convert_logic, 999);

        add_filter('woocommerce_currency_symbol', function($symbol) use ($to_curr) {
            switch($to_curr) {
                case 'COP': return 'COP$ ';
                case 'EUR': return '€';
                default: return '$';
            }
        }, 999);
    }
    return $is_rest_api;
});

/**
 * FORZADO ULTRA-PRIORITARIO DE BOTONES PAYPAL
 * Esto sobreescribe los ajustes del panel de administración
 */
add_filter('woocommerce_paypal_payments_product_button_config', function($config) {
    // Forzamos el objeto style completo
    $config['style'] = [
        'layout' => 'vertical',
        'color'  => 'silver',    // Forzamos Negro
        'shape'  => 'rect',     // Forzamos Rectangular
        'label'  => 'checkout',
        'height' => 45          // Altura ideal para botones modernos
    ];
    
    // Desactivamos el botón de "Pay Later" (opcional, para limpieza visual)
    $config['disable-funding'] = ['paylater', 'venmo'];
    
    return $config;
}, 9999, 1); // Prioridad máxima para ganar a cualquier otro plugin