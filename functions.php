<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL: Solo carga esto si la página usa nuestra plantilla de React
    if ( is_page_template('template-react.php') ) {

        // Cargar el CSS de React con el nombre exacto del build
        wp_enqueue_style(
            'react-app-style', 
            get_template_directory_uri() . '/react-app/dist/assets/index-DcD9jzaE.css', 
            array(), 
            null
        );

        // Cargar el JS de React con el nombre exacto del build
        wp_enqueue_script(
            'react-app-main', 
            get_template_directory_uri() . '/react-app/dist/assets/index-CSqGYIcR.js', 
            array(), 
            null, 
            true
        );
    }

    // Estilos generales del tema (Astra / Main Styles)
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// 2. FILTRO PARA MÓDULOS (Crucial para que React funcione en producción)
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" src="' . esc_url($src) . '"></script>';
}, 10, 3);