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
 * 5. INTEGRACIÓN FORZADA CON FOX (WOOCS) - CORRECCIÓN API
 */
add_action('init', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
        $currency = isset($_GET['currency']) ? strtoupper(sanitize_text_field($_GET['currency'])) : null;
        
        if (!$currency && isset($_COOKIE['woocs_current_currency'])) {
            $currency = $_COOKIE['woocs_current_currency'];
        }

        if ($currency) {
            global $WOOCS;
            if (class_exists('WOOCS')) {
                // Importante: No re-instanciar con 'new' si ya existe la global
                if (!$WOOCS) {
                    $WOOCS = new WOOCS();
                }
                $WOOCS->set_currency($currency);
            }

            add_filter('woocommerce_currency', function() use ($currency) {
                return $currency;
            }, 9999);
        }
    }
}, 1);

/**
 * 6. RESPUESTA API - CONVERSIÓN MANUAL (CON RECOLECCIÓN DE TASAS DE EMERGENCIA)
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $currency = $request->get_param('currency');
    
    if ($currency) {
        $currency = strtoupper(sanitize_text_field($currency));
        $data = $response->get_data();
        global $WOOCS;
        
        $raw_price = (float)$product->get_price();
        $final_price = $raw_price;
        $rate = 1;

        if ($WOOCS) {
            // 1. Intentamos obtener tasas de la forma oficial
            $currencies = $WOOCS->get_currencies();
            
            // 2. Si la tasa es 1 o no existe, intentamos extraerla de la base de datos directamente
            if (!isset($currencies[$currency]) || (float)$currencies[$currency]['rate'] == 1) {
                $woocs_options = get_option('woocs', array());
                if (!empty($woocs_options['currencies'])) {
                    $currencies = $woocs_options['currencies'];
                }
            }

            if (isset($currencies[$currency])) {
                $rate = (float)$currencies[$currency]['rate'];
                $final_price = $raw_price * $rate;
            }
        }

        $symbol = get_woocommerce_currency_symbol($currency);
        $formatted_price = number_format($final_price, 2, '.', ',');
        
        // Inyectamos el HTML dinámico
        $data['price_html'] = '<span class="price"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">'.$symbol.'</span>'.$formatted_price.'</bdi></span></span>';
        
        // Debug para confirmar en consola
        $data['debug_info'] = [
            'moneda' => $currency,
            'precio_base' => $raw_price,
            'tasa_leida' => $rate,
            'precio_final' => $final_price,
            'usó_backup_db' => (!isset($WOOCS->get_currencies()[$currency])) ? 'Sí' : 'No'
        ];

        $response->set_data($data);
    }
    return $response;
}, 9999, 3);

/**
 * 7. PASAR LA MONEDA ACTUAL DE FOX A REACT AUTOMÁTICAMENTE
 */
add_action('wp_head', function() {
    global $WOOCS;
    // Intentamos obtener la moneda de la global o de la instancia directa
    $current = '';
    if (isset($WOOCS) && !empty($WOOCS->current_currency)) {
        $current = $WOOCS->current_currency;
    } elseif (class_exists('WOOCS')) {
        $WOOCS_LOCAL = new WOOCS();
        $current = $WOOCS_LOCAL->current_currency;
    }

    if ($current) {
        echo "<script>
            window.foxConfig = {
                currentCurrency: '" . esc_js($current) . "'
            };
            console.log('--- FOX PHP DEBUG ---');
            console.log('Moneda detectada en PHP: " . esc_js($current) . "');
        </script>";
    }
});