<?php

function enqueue_astra_personal_react() {
    // 1. El script de seguridad (Preamble) - ESTO SOLUCIONA TU ERROR
    echo '
    <script type="module">
        import RefreshRuntime from "http://localhost:5173/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
    </script>';
// Esto carga tu style.css y le dice a WP que la versión cambió (usando la hora actual)
wp_enqueue_style('main-styles', get_stylesheet_uri(), array(), time());
    // 2. Cargamos el cliente de Vite
    wp_enqueue_script('vite-client', 'http://localhost:5173/@vite/client', array(), null, true);
    
    // 3. Cargamos el archivo principal de React
    wp_enqueue_script('react-app-main', 'http://localhost:5173/src/main.jsx', array(), null, true);
}
add_action('wp_head', 'enqueue_astra_personal_react'); // Lo cambiamos a wp_head para que cargue antes

// Filtro para los módulos
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if (!in_array($handle, ['vite-client', 'react-app-main'])) {
        return $tag;
    }
    return '<script type="module" src="' . esc_url($src) . '"></script>';
}, 10, 3);