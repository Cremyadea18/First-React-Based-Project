<?php
/**
 * Template Name: Pagina React Hibrida
 */

get_header(); ?>

<style>
    /* Forzamos que el contenedor tenga espacio para renderizar */
    #root {
        min-height: 400px;
        width: 100%;
        display: block !important;
        border: 1px solid #eee; /* Temporal para debug */
    }
</style>

<main id="primary" class="site-main"> 
    <div id="root">
        <p style="text-align:center; padding: 50px;">Cargando aplicación de React...</p>
    </div>
</main>

<?php get_footer(); ?>