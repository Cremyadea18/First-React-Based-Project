<?php
/*
Template Name: Carrito Custom React
*/

get_header(); 
?>

<div class="cart-page-wrapper">
    <div class="container">
        <?php
       
        while ( have_posts() ) : the_post();
            the_content(); 
        endwhile;
        ?>
    </div>
</div>

<?php
get_footer(); 
?>