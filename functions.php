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
 * 5. INTEGRACIÓN FORZADA CON FOX (WOOCS)
 */
add_action('init', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
        // 1. Detectar moneda de la URL o de la Cookie de FOX
        $currency = isset($_GET['currency']) ? strtoupper(sanitize_text_field($_GET['currency'])) : null;
        
        if (!$currency && isset($_COOKIE['woocs_current_currency'])) {
            $currency = $_COOKIE['woocs_current_currency'];
        }

        if ($currency) {
            global $WOOCS;
            // Si la global falla, intentamos instanciarla o usar el método estático
            if (class_exists('WOOCS')) {
                global $wp_query;
                $WOOCS = new WOOCS(); // Forzamos instancia si no existe
                $WOOCS->set_currency($currency);
            }

            add_filter('woocommerce_currency', function() use ($currency) {
                return $currency;
            }, 9999);
        }
    }
}, 1); // Prioridad 1 para que sea lo primero que ocurra

/**
 * 6. RESPUESTA API CON CONVERSIÓN MATEMÁTICA FORZADA
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    if ($currency) {
        $currency = strtoupper(sanitize_text_field($currency));
        $data = $response->get_data();
        
        global $WOOCS;
        
        // 1. Obtener el precio original (en la moneda base, ej: USD)
        $raw_price = $product->get_price();
        $final_price = $raw_price;

        // 2. FORZAR CONVERSIÓN MATEMÁTICA
        if ($WOOCS) {
            // Esta función de FOX hace la magia de la multiplicación (Ej: 100 * 0.92)
            $final_price = $WOOCS->woocs_exchange_value($raw_price);
        }

        // 3. OBTENER SÍMBOLO
        $symbol = get_woocommerce_currency_symbol($currency);

        // 4. RECONSTRUIR EL HTML DEL PRECIO (Lo que ve el usuario)
        // Usamos number_format para que el número se vea limpio
        $formatted_price = number_format($final_price, 2, '.', ',');
        
        $data['price_html'] = '<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">'.$symbol.'</span>'.$formatted_price.'</bdi></span>';
        
        // 5. DEBUG PARA CONSOLA
        $data['debug_info'] = [
            'moneda_solicitada' => $currency,
            'precio_original' => $raw_price,
            'precio_convertido' => $final_price,
            'tasa_cambio_usada' => ($raw_price > 0) ? ($final_price / $raw_price) : 1
        ];

        $response->set_data($data);
    }
    return $response;
}, 9999, 3);

/**
 * PASAR LA MONEDA ACTUAL DE FOX A REACT AUTOMÁTICAMENTE
 */
add_action('wp_head', function() {
    global $WOOCS;
    if ($WOOCS) {
        $current = $WOOCS->current_currency;
        echo "<script>
            window.foxConfig = {
                currentCurrency: '" . esc_js($current) . "'
            };
            console.log('PHP a JS: Moneda enviada -> " . esc_js($current) . "');
        </script>";
    }
});