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
 * 6. RESPUESTA API - CONVERSIÓN DINÁMICA (YAHOO FINANCE / FOX)
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    if (!is_object($product)) return $response;

    $currency = $request->get_param('currency');
    if (!$currency) return $response;

    $currency = strtoupper(sanitize_text_field($currency));
    $data = $response->get_data();
    
    // Precio base (USD)
    $raw_price = (float)$product->get_price();
    
    $rate = 1.0; // Valor por defecto

    // Intentamos sacar la tasa que FOX obtuvo de Yahoo Finance
    global $WOOCS;
    if ($WOOCS) {
        $currencies = $WOOCS->get_currencies();
        if (isset($currencies[$currency]) && (float)$currencies[$currency]['rate'] > 0) {
            $rate = (float)$currencies[$currency]['rate'];
        }
    }

    // Si la tasa sigue siendo 1 y no es USD, es que FOX/Yahoo falló. 
    // Opcional: Podrías poner una tasa de respaldo aquí
    if ($rate == 1.0 && $currency === 'EUR') {
        $rate = 0.92; // Respaldo manual solo si falla la conexión
    }

    $final_price = $raw_price * $rate;

    
    $symbol = get_woocommerce_currency_symbol($currency);
    $formatted_value = number_format($final_price, 2, '.', ',');
    
    $data['price_html'] = sprintf(
        '<span class="price"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">%s</span>%s</bdi></span></span>',
        $symbol,
        $formatted_value
    );

    $data['debug_info'] = [
        'moneda' => $currency,
        'tasa_usada' => $rate,
        'fuente' => ($rate != 0.92) ? 'Yahoo/FOX' : 'Respaldo Manual'
    ];

    $response->set_data($data);
    return $response;
}, 9999, 3);

add_action('wp_head', function() {
    global $WOOCS;
    
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

/**
 * INTEGRACIÓN DE INTELIGENCIA ARTIFICIAL GEMINI CON WORDPRESS
 */

// 1. Registrar el endpoint REST (Solo uno, para evitar conflictos)
add_action('rest_api_init', function () {
    register_rest_route('mi-tema/v1', '/gemini', [
        'methods'             => 'POST',
        'callback'            => 'handle_gemini_request',
        'permission_callback' => '__return_true', 
    ]);
});

// 2. Función principal corregida
function handle_gemini_request($request) {

    // ✅ API key: Intenta sacarla de wp-config.php o ponla aquí para probar si falla
    $api_key = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : 'TU_NUEVA_API_KEY_AQUI'; 
    
    if (empty($api_key) || $api_key === 'TU_NUEVA_API_KEY_AQUI') {
        return new WP_Error('no_api_key', 'API key no configurada en el servidor', ['status' => 500]);
    }

    // ✅ Leer y validar el mensaje
    $params = $request->get_json_params();
    $user_message = sanitize_text_field($params['message'] ?? '');
    
    if (empty($user_message)) {
        return new WP_Error('empty_message', 'El mensaje está vacío', ['status' => 400]);
    }

    // ✅ Verificar nonce (Seguridad)
    $nonce = $request->get_header('X-WP-Nonce');
    if (!wp_verify_nonce($nonce, 'wp_rest')) {
        return new WP_Error('invalid_nonce', 'Sesión expirada o no autorizada', ['status' => 403]);
    }

    // ✅ URL Corregida: Usamos v1 y el modelo estable
   $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

    $body = [
        "contents" => [[
            "parts" => [["text" => $user_message]]
        ]]
    ];

    // Llamada a la API
    $response = wp_remote_post($url, [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode($body),
        'timeout' => 45, // Un poco más de tiempo para IA
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('request_failed', $response->get_error_message(), ['status' => 500]);
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $data = json_decode(wp_remote_retrieve_body($response), true);

    // ✅ Manejo de errores de cuota o modelo
    if ($status_code !== 200) {
        $error_msg = $data['error']['message'] ?? 'Error desconocido';
        return new WP_Error('gemini_error', "Error de Google: " . $error_msg, ['status' => $status_code]);
    }

    // ✅ Extraer respuesta
    $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No recibí respuesta de la IA.';

    return rest_ensure_response([
        'status'  => 'ok',
        'message' => $reply,
    ]);
}

// 3. Inyectar configuraciones necesarias para React
add_action('wp_head', function() {
    ?>
    <script type="text/javascript">
        window.canabbisSettings = {
            nonce: '<?php echo wp_create_nonce("wp_rest"); ?>',
            restUrl: '<?php echo esc_url_raw(rest_url()); ?>'
        };
    </script>
    <?php
});