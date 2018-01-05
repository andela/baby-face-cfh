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
  const offset = 60;
  
  $('.navbar li .scroller').click(function(event) {
      event.preventDefault();
      $($(this).attr('href'))[0].scrollIntoView();
      scrollBy(0, -offset);
  });
});
