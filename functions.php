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
 * 5. CONVERSIÓN ÚNICA AL FINAL DE LA REST API (MÉTODO SEGURO)
 */
add_filter('woocommerce_rest_prepare_product', function($response, $post, $request) {
    // Solo actuamos si el parámetro 'currency' está en la URL de la API
    $currency = $request->get_param('currency');
    if (!$currency) return $response;

    $to_curr = strtoupper(sanitize_text_field($currency));
    if ($to_curr === 'USD') return $response;

    // Obtener la tasa de cambio
    $rate = 1;
    if (class_exists('\YayCurrency\Internal\Helpers\CurrencyHelper')) {
        $rate = \YayCurrency\Internal\Helpers\CurrencyHelper::get_rate($to_curr);
    }

    if (!$rate || $rate == 1) {
        $manual_rates = ['COP' => 3996.25, 'EUR' => 0.8468];
        $rate = isset($manual_rates[$to_curr]) ? $manual_rates[$to_curr] : 1;
    }

    // Obtenemos los datos actuales de la respuesta
    $data = $response->get_data();

    // Función interna para multiplicar con seguridad
    $convert = function($price) use ($rate) {
        if ( !is_numeric($price) || empty($price) ) return $price;
        return (string)round((float)$price * (float)$rate, 2);
    };

    // Convertimos todos los campos de precio en el JSON final
    $data['price']          = $convert($data['price']);
    $data['regular_price']  = $convert($data['regular_price']);
    $data['sale_price']     = $convert($data['sale_price']);

    // También convertimos los precios dentro de las variaciones si existen
    if (!empty($data['variations'])) {
        // (Opcional si usas productos variables)
    }

    // Seteamos los nuevos datos convertidos en la respuesta
    $response->set_data($data);

    return $response;
}, 10, 3);