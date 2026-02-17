<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL ESTRICTO: Solo cargar en tu página híbrida
    if ( is_page('hibrid-page') || is_page_template('template-react.php') ) {
        
        $theme_uri = get_template_directory_uri();
        
        // USAMOS TIME() PARA ROMPER LA CACHÉ: 
        // Genera un número único basado en el segundo actual (ej: 17713345)
        $version = time(); 

        // Cargar el CSS de React
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        // Cargar el JS de React
        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            $version, 
            true 
        );
    }

    // Estilos generales del tema
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// 2. FILTRO MEJORADO: Mantenemos el type="module" y el "defer"
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    // Defer es clave para que el DOM esté listo antes de que React intente montar el root
    return '<script type="module" defer src="' . esc_url($src) . '"></script>';
}, 10, 3);

// Permitir acceso público a los productos vía REST API
add_filter( 'woocommerce_rest_check_permissions', function( $permission, $context, $object_id, $post_type ) {
    if ( $post_type === 'product' && $context === 'read' ) {
        return true;
    }
    return $permission;
}, 10, 4 );