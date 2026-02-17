<?php

function enqueue_react_app_custom() {
    // Obtenemos el slug o ID de la página para asegurar la carga
    global $post;
    
    // CARGA SI: Es la plantilla física O si el slug de la página es 'hibrid-page'
    if ( is_page_template('template-react.php') || (isset($post->post_name) && $post->post_name === 'hibrid-page') ) {

        $theme_uri = get_template_directory_uri();
        $version = time(); // Fuerza la actualización para evitar caché vieja

        // CSS con versión dinámica
        wp_enqueue_style(
            'react-app-style', 
            $theme_uri . '/index.css', 
            array(), 
            $version
        );

        // JS con versión dinámica
        wp_enqueue_script(
            'react-app-main', 
            $theme_uri . '/index.js', 
            array(), 
            $version, 
            true
        );
    }

    // Estilos generales
    wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
}