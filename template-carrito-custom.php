<?php
/*
Template Name: Carrito Custom React
*/

get_header(); 
?>

<div class="cart-page-wrapper">
    <div class="cart_page_wrapper_content">
        <?php
       
        while ( have_posts() ) : the_post();
            the_content(); 
        endwhile;
        ?>
    </div>
    <div class="related-products-container" style="margin-top: 80px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 40px;">
                <?php
                
                woocommerce_output_related_products();
                ?>
            </div>
</div>

<?php
get_footer(); 
?>