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
 * 5. 🔥 CORRECCIÓN FINAL: Conversión Manual mediante Tasa de Cambio
 */
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api) {
    if ($is_rest_api && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        // 1. Forzar moneda global
        add_filter('woocommerce_currency', function() use ($to_curr) {
            return $to_curr;
        }, 999);

        // 2. Función maestra de conversión numérica
        $convert_logic = function($price) use ($to_curr) {
            if (empty($price) || !is_numeric($price)) return $price;
            
            // Si es USD, no convertimos (asumiendo que es la base)
            if ($to_curr === 'USD') return $price;

            // Intentamos obtener la tasa de cambio de YayCurrency
            // Si el plugin no nos da el valor, buscamos una tasa estimada 
            // (Puedes ajustar estos números manualmente si la API de Yay falla)
            $rate = 1;
            if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
                $rate = \YayCurrency\Internal\Helpers\CurrencyHelper::get_rate($to_curr);
            }

            // Si no detecta tasa, ponemos unas de respaldo (Opcional)
            if (!$rate || $rate == 1) {
                if ($to_curr === 'COP') $rate = 4000; // Tasa ejemplo
                if ($to_curr === 'EUR') $rate = 0.92;
            }

            return (float)$price * (float)$rate;
        };

        // 3. Aplicar a los precios brutos antes de generar el HTML
        add_filter('woocommerce_product_get_price', $convert_logic, 999);
        add_filter('woocommerce_product_get_regular_price', $convert_logic, 999);
        add_filter('woocommerce_product_get_sale_price', $convert_logic, 999);

        // 4. Asegurar que el símbolo sea el correcto
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