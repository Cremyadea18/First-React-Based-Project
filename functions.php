<?php

function enqueue_react_app_custom() {
    $theme_uri = get_template_directory_uri();
    $version = time(); // Cache busting activo

    // 1. DEFINIMOS DÓNDE CARGAR REACT
    // Agrega aquí los "slugs" de tus nuevas páginas de Elementor en el array is_page
    $cargar_en_paginas = is_page(array('hibrid-page','Home','servicios', 'contacto', 'sobre-nosotros'));
    $es_template_react = is_page_template('template-react.php');
    $es_producto = is_product();

    // 2. CONDICIONAL GLOBAL
    if ( $cargar_en_paginas || $es_template_react || $es_producto ) {
        
        // Cargar el CSS de React (Global para estilos de botones, glassmorphism, etc.)
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        // Cargar el JS de React
        // Ahora lo cargamos SIEMPRE en estas páginas porque el nuevo main.jsx 
        // solo montará los componentes si encuentra el ID (react-hero, react-products, etc.)
        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            $version, 
            true 
        );
    }

    // Estilos generales del tema Astra/Hijo
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// Filtro para mantener el soporte de Módulos de JS (Vite)
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" defer src="' . esc_url($src) . '"></script>';
}, 10, 3);

// Acceso público a la API de WooCommerce
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