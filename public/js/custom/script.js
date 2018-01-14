AOS.init({
  duration: 1200
});
$(document).ready(() => {
  $(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });
  const stickyToggle = (sticky, stickyWrapper, scrollElement) => {
    const stickyHeight = sticky.outerHeight();
    const stickyTop = stickyWrapper.offset().top;
    if (scrollElement.scrollTop() >= stickyTop) {
      stickyWrapper.height(stickyHeight);
      sticky.addClass('is-sticky');
    } else {
      sticky.removeClass('is-sticky');
      stickyWrapper.height('auto');
    }
  };

  // Find all data-toggle="sticky-onscroll" elements
  $('[data-toggle="sticky-onscroll"]').each(function () {
    const sticky = $(this);
    // insert hidden element to maintain actual top offset on page
    const stickyWrapper = $('<div>').addClass('sticky-wrapper');
    sticky.before(stickyWrapper);
    sticky.addClass('sticky');

    // Scroll & resize events
    $(window).on('scroll.sticky-onscroll resize.sticky-onscroll', function () {
      stickyToggle(sticky, stickyWrapper, $(this));
    });

    // On page load
    stickyToggle(sticky, stickyWrapper, $(window));
  });
});
