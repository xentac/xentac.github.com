/* Author: 

*/

$(function() {
    $('nav ul li a').tipsy({fade: true, gravity: 'n'});
    $('footer nav ul li a').tipsy({fade: true, gravity: 's'});
    $('aside ul.posts li a').tipsy({fade: true, gravity: 'w'});
	$('.jump-link').tipsy({gravity: 's',fade: true,fallback:'Read More'});
})
