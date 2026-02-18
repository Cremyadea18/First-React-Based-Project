<?php
/*
Template Name: Checkout Custom React
*/

get_header(); 
?>

<div class="checkout-page-wrapper">
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