<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL ESTRICTO: Solo cargar en tu página híbrida
    // Esto evita que Astra o WooCommerce interfieran en otras páginas
    if ( is_page('hibrid-page') || is_page_template('template-react.php') ) {
        
        $theme_uri = get_template_directory_uri();
        
        // Usamos una versión fija durante esta prueba para estabilidad
        $version = '1.0.1'; 

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
            true // En el footer es correcto
        );
    }

    // Estilos generales del tema (siempre cargan)
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), '1.0.0');
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// 2. FILTRO MEJORADO: Añadimos 'module' y 'defer'
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    // 'defer' es vital para evitar el error de "Target container is not a DOM element" o dobles cargas
    return '<script type="module" defer src="' . esc_url($src) . '"></script>';
}, 10, 3);