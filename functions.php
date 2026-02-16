<?php

function enqueue_react_app_custom() {
    // 1. CONDICIONAL: Solo carga esto si la página usa nuestra plantilla de React
    if ( is_page_template('template-react.php') ) {

        $theme_uri = get_template_directory_uri();

        // Cargar el CSS de React (ahora en la raíz del tema)
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            null
        );

        // Cargar el JS de React (ahora en la raíz del tema)
        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            null, 
            true // Esto lo carga en el footer
        );
    }

    // Estilos generales del tema (Astra / Main Styles)
    // Usamos time() para evitar que el navegador guarde una versión vieja en caché
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// 2. FILTRO PARA MÓDULOS (Obligatorio para React Moderno / Vite)
add_filter('script_loader_tag', function($tag, $handle, $src) {
    // El 'handle' debe coincidir exactamente con el nombre que pusimos arriba
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    // Añadimos type="module" para que el navegador entienda los imports de React
    return '<script type="module" src="' . esc_url($src) . '"></script>';
}, 10, 3);