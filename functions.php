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
 * 5. CONVERSIÓN DINÁMICA PARA LA REST API - VERSIÓN DE ÚNICO PASO
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        add_filter('woocommerce_currency', function() use ($to_curr) {
            return $to_curr;
        }, 999);

        // Definimos la lógica
        $convert_logic = function($price, $product) use ($to_curr) {
            // Si el precio es vacío o ya es USD, no hacer nada
            if ('' === $price || $to_curr === 'USD') return $price;

            // Evitamos que YayCurrency u otros plugins interfieran en la tasa
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

            // --- EL TRUCO: REMOCIÓN TEMPORAL ---
            // Removemos los filtros para que las llamadas internas de WC no vuelvan a entrar aquí
            remove_filter('woocommerce_product_get_price', 'convert_logic_handler', 999);
            remove_filter('woocommerce_product_get_regular_price', 'convert_logic_handler', 999);
            remove_filter('woocommerce_product_get_sale_price', 'convert_logic_handler', 999);

            $converted_price = (float)$price * (float)$rate;

            return $converted_price;
        };

        // Para que remove_filter funcione, necesitamos una función nombrada o una variable
        function convert_logic_handler($price, $product) {
            // Accedemos a la moneda desde la URL
            $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
            
            // Si ya se ha convertido este producto en esta ejecución, lo marcamos
            static $processed = [];
            if (isset($processed[$product->get_id()])) return $price;

            $rate = 3996.25; // Default para COP si Yay no carga
            if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
                $r = \YayCurrency\Internal\Helpers\CurrencyHelper::get_rate($to_curr);
                if($r) $rate = $r;
            }

            $processed[$product->get_id()] = true;
            return (float)$price * (float)$rate;
        }

        add_filter('woocommerce_product_get_price', 'convert_logic_handler', 999, 2);
        add_filter('woocommerce_product_get_regular_price', 'convert_logic_handler', 999, 2);
        add_filter('woocommerce_product_get_sale_price', 'convert_logic_handler', 999, 2);

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