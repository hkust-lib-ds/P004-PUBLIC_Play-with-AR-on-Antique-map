$(document).ready(function() {
    $('#header-angle-up').click(function(){
        $('#more-hkust').toggleClass('drawer-shown');
        $('.header-desktop__trigger').toggleClass('more-active');
        if($('#more-hkust.drawer-shown').length <= 0){
        $('.drawer-wrapper').removeClass('active');
        $('#header-angle-up>.fa').removeClass('active');
        }else{
        $('.drawer-wrapper').addClass('active');
        $('#header-angle-up>.fa').addClass('active');
        }
    });

});