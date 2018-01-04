var stickyToggle = function(sticky, stickyWrapper, scrollElement) {
  var stickyHeight = sticky.outerHeight();
  var stickyTop = stickyWrapper.offset().top;
  if (scrollElement.scrollTop() >= stickyTop){
    stickyWrapper.height(stickyHeight);
    sticky.addClass("is-sticky");
  }
  else{
    sticky.removeClass("is-sticky");
    stickyWrapper.height('auto');
  }
};

// Find all data-toggle="sticky-onscroll" elements
$('[data-toggle="sticky-onscroll"]').each(function() {
  var sticky = $(this);
  var stickyWrapper = $('<div>').addClass('sticky-wrapper'); // insert hidden element to maintain actual top offset on page
  sticky.before(stickyWrapper);
  sticky.addClass('sticky');
  
  // Scroll & resize events
  $(window).on('scroll.sticky-onscroll resize.sticky-onscroll', function() {
    stickyToggle(sticky, stickyWrapper, $(this));
  });
  
  // On page load
  stickyToggle(sticky, stickyWrapper, $(window));
});
$(document).ready(function() {
  AOS.init({
    duration: 1200,
  })
    console.log("working")
    
  // $(window).bind('scroll', function() {
  //   var navHeight = $(window).height() - 89;
  //   console.log(navHeight);
  //   console.log('windows...', $(window).scrollTop())
  //   if ($(window).scrollTop() > navHeight) {
  //     $('nav').addClass('fixed-top');
  //   } else {
  //     $('nav').removeClass('fixed-top');
  //   }
  // });

  
  // $('body').on('mouseenter mouseleave', '.dropdown', function(e) {
  //   var _d = $(e.target).closest('.dropdown');
  //   _d.addClass('show');
  //   setTimeout(function() {
  //     _d[_d.is(':hover') ? 'addClass' : 'removeClass']('show');
  //   }, 300);
  // });
});
