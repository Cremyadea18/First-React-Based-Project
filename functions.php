<?php

function enqueue_react_app_custom() {
    $theme_uri = get_template_directory_uri();
    
    // Usamos time() para que cada carga sea "nueva" y saltarnos la caché del navegador
    $version = time(); 

    // 1. Cargamos el CSS de React
    wp_enqueue_style(
        'react-app-style', 
        $theme_uri . '/index.css', 
        array(), 
        $version
    );

    // 2. Cargamos el JS de React
    wp_enqueue_script(
        'react-app-main', 
        $theme_uri . '/index.js', 
        array(), 
        $version, 
        true // Se carga en el footer
    );

    // Estilos generales del tema
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}

add_action('wp_enqueue_scripts', 'enqueue_react_app_custom');

// IMPORTANTE: No olvides mantener el filtro del type="module" abajo
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ($handle !== 'react-app-main') {
        return $tag;
    }
    return '<script type="module" src="' . esc_url($src) . '"></script>';
}, 10, 3);