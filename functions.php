<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL AMPLIADO: 
    // Ahora incluye is_product() para que tus estilos lleguen a la plantilla de producto
    if ( is_page('hibrid-page') || is_page_template('template-react.php') || is_product() ) {
        
        $theme_uri = get_template_directory_uri();
        $version = time(); // Seguimos rompiendo caché

        // Cargar el CSS de React (¡Ahora también cargará en cada producto!)
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        // Solo cargamos el JS de React si NO estamos en un producto individual
        // Esto evita que React intente buscar el ID "root" en la página del producto y de error.
        if ( ! is_product() ) {
            wp_enqueue_script(
                'react-app-main', 
                $theme_uri . '/index.js', 
                array(), 
                $version, 
                true 
            );
        }
    }

    // Estilos generales del tema
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// Filtro para el JS de React (Mantenemos como estaba)
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" defer src="' . esc_url($src) . '"></script>';
}, 10, 3);

// Acceso público a la API
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