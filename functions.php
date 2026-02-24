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
 * 5. INTEGRACIÓN DEFINITIVA CON FOX (WOOCS) - CORRECCIÓN PARA LISTAS/BUSCADOR
 */

// A. Inicialización global de la moneda para cualquier petición API
add_action('init', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false && isset($_GET['currency'])) {
        $to_curr = strtoupper(sanitize_text_field($_GET['currency']));
        
        global $WOOCS;
        if ($WOOCS) {
            $WOOCS->set_currency($to_curr);
        }

        // B. FORZADO INDIVIDUAL (Este es el que arregla el Buscador)
        // Obligamos a WC a devolver el precio convertido por FOX en cada llamada
        add_filter('woocommerce_product_get_price', function($price, $product) use ($to_curr) {
            global $WOOCS;
            if ($WOOCS && $WOOCS->current_currency !== $WOOCS->default_currency) {
                return $WOOCS->woocs_exchange_value($price);
            }
            return $price;
        }, 999, 2);

        // Forzamos el símbolo correcto
        add_filter('woocommerce_currency_symbol', function($symbol) use ($to_curr) {
            switch($to_curr) {
                case 'EUR': return '€';
                case 'USD': return '$';
                default: return $symbol;
            }
        }, 999);
    }
});

/**
 * 6. PREPARACIÓN DE RESPUESTA JSON PARA REACT
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    if ($currency) {
        $data = $response->get_data();
        
        // Regeneramos el HTML del precio para que tome la moneda del filtro anterior
        // Esto es lo que pinta el buscador en React
        $data['price_html'] = $product->get_price_html();
        
        // Precios numéricos limpios
        $data['price']          = (string)wc_get_price_to_display($product);
        $data['regular_price']  = (string)wc_get_price_to_display($product, array('price' => $product->get_regular_price()));
        $data['sale_price']     = (string)wc_get_price_to_display($product, array('price' => $product->get_sale_price()));

        $response->set_data($data);
    }
    return $response;
}, 999, 3);