<?php

function enqueue_react_app_custom() {
    $theme_uri = get_template_directory_uri();
    $version = time(); // Cache busting activo para ver cambios al instante

    /**
     * CONDICIONAL INTELIGENTE:
     * Cargamos React en:
     * 1. Todas las "Páginas" de WordPress (is_page). Esto incluye Home, About, y cualquier página de Elementor.
     * 2. Plantillas de React específicas.
     * 3. Páginas de producto individual.
     */
    if ( is_page() || is_page_template('template-react.php') || is_product() ) {
        
        // 1. CSS de React
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        // 2. JS de React
        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            $version, 
            true 
        );
    }

    // Estilos generales del tema Astra/Hijo
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), $version);
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// Filtro clave para que Vite/React funcione (type="module")
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    // Añadimos crossOrigin para evitar problemas de carga de assets
    return '<script type="module" crossorigin src="' . esc_url($src) . '"></script>';
}, 10, 3);

// Acceso público a la API de WooCommerce (Read-only para productos)
add_filter( 'woocommerce_rest_check_permissions', function( $permission, $context, $object_id, $post_type ) {
    if ( $post_type === 'product' && $context === 'read' ) {
        return true;
    }
    return $permission;
}, 10, 4 );

// Soporte oficial de WooCommerce
function mytheme_add_woocommerce_support() {
    add_theme_support( 'woocommerce' );
}
add_action( 'after_setup_theme', 'mytheme_add_woocommerce_support' );