<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL: Solo carga esto si la página usa nuestra plantilla de React
    if ( is_page_template('template-react.php') ) {

        // En producción (cPanel), ya no usamos localhost. 
        // Apuntamos a los archivos que generó el comando "npm run build".
        
        // Cargar el CSS de React (Vite genera uno en dist/assets/)
        wp_enqueue_style(
            'react-app-style', 
            get_template_directory_uri() . '/react-app/dist/assets/index.css', 
            array(), 
            '1.0'
        );

        // Cargar el JS de React (Vite genera uno en dist/assets/index.js)
        wp_enqueue_script(
            'react-app-main', 
            get_template_directory_uri() . '/react-app/dist/assets/index.js', 
            array(), 
            null, 
            true
        );
    }

    // Estilos generales del tema (Estos sí se cargan en todo el sitio)
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

// Cambiamos a wp_enqueue_scripts (es la forma estándar y más segura que wp_head)
add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// 2. FILTRO PARA MÓDULOS (Necesario para que el JS de Vite funcione)
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" src="' . esc_url($src) . '"></script>';
}, 10, 3);