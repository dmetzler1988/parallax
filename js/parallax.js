var animationframe = (function() {
  'use strict';

  // SPEED set between 0 (no parallax) and 1 (max-parallax)
  var SPEED = .2,
        THROTTLE = 1,
        SELECTOR_CLASS = '.js-parallax';

  var viewportHeight = null,
      revealer = null;

  var _requestAnimationFrame = window.requestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.oRequestAnimationFrame
      || window.msRequestAnimationFrame;

  function init() {
    revealer = document.querySelectorAll(SELECTOR_CLASS);
    getViewportHeight();

    if (revealer.length > 0) {
      draw();
    }
  }

  // Throttle
  // http://underscorejs.org/#throttle
  function throttle(func, wait, options) {
    var _ = {
      now: Date.now || function() {
        return new Date().getTime();
      }
    };
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) {
      options = {};
    }
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) {
        previous = now;
      }
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  function getViewportHeight() {
    // get viewport Size
    // http://www.w3schools.com/js/js_window.asp

    // viewport height
    viewportHeight = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;
  }

  /**
   * Returns a negative rounded offset top position of element.
   *
   * @param {object} elem
   * @returns {number}
   */
  function checkPosition(elem) {
    var offset = -(elem.offsetParent.getBoundingClientRect().top);

    return offset;
  }

  function resizeEvent() {
    // getViewportHeight;
    scrollEvent();
  }

  function setShift(elem) {
      return (viewportHeight - elem.offsetHeight) * .5;
  }

  function setRelation(elem) {
      return (elem.offsetHeight / viewportHeight).toFixed(3);
  }

  function setScale(elem) {
      return ((1 - elem) * SPEED) + 1;
  }

  /**
   * Add the parallax effect to each element.
   * It starts only if element is in viewport and ends when element
   * is out of viewport.
   */
  function scrollEvent(){
    for (var i = 0; i < revealer.length; i++) {
      singleScrollEvent(revealer[i]);
    }
  }

  function singleScrollEvent(elem) {
    // check current position of the element
    var inViewPort = checkPosition(elem);

    // add style for better performance
    if (elem.style.willChange != 'transform') {
      elem.style.willChange = 'transform';
    }

    // in viewport
    if ( (-viewportHeight < inViewPort) &&  (inViewPort < viewportHeight)) {


      // shift value to center element vertically
      // TODO: don't calculate all the time
      var shift = setShift(elem);

      // relation needed for scale
      // TODO: don't calculate all the time
      var relation = setRelation(elem);

      // SET SCALE 
      // TODO: don't calculate all the time
      var scale = setScale(relation);


      // add class when in viewport revealed
      elem.classList.add('revealed');

      // SCROLL VALUE IN %
      var scrollValue = ((inViewPort + shift) * 100 * SPEED / viewportHeight).toFixed(2);

      // PARALLAX
      elem.style.transform = 'translate3d(0,' + scrollValue + '%, 0) scale(' + scale.toFixed(4) + ')';

    } else {
      // remove class when not in viewport
      elem.classList.remove('revealed');
    }
  }

  function draw() {
    // Cutting the mustard
    // http://webfieldmanual.com/guides/cutting-the-mustard.html
    if (window.requestAnimationFrame && document.documentElement.classList) {
      // Passes the test so add enhanced class to HTML tag
      document.documentElement.classList.add('enhanced');

      // Throttle events and requestAnimationFrame
      var scrollHandler = throttle(function() {
        _requestAnimationFrame(scrollEvent);
      }, THROTTLE);

      var resizeHandler = throttle(function() {
        _requestAnimationFrame(scrollEvent);
      }, THROTTLE * 10);

      scrollHandler();

      // Listening for events
      if (window.addEventListener) {
        addEventListener('scroll', scrollHandler, false);
        addEventListener('resize', resizeHandler, false);
      } else if (window.attachEvent) {
        window.attachEvent('onscroll', scrollHandler);
        window.attachEvent('onresize', resizeHandler);
      } else {
        window.onscroll = scrollHandler;
        window.onresize = resizeHandler;
      }
    }
  }

  return {
    init : init
  };

})(window, document, animationframe);


animationframe.init();