var animationframe = (function() {
    'use strict';

    // SPEED set between 0 (no parallax) and 1 (max-parallax)
    var SPEED = .2,
        THROTTLE = 1,
        SELECTOR_CLASS = '.js-parallax';

    var viewportHeight = null,
        revealer = null;

    var shiftValues = [],
        shiftValuesBefore = [];

    var relationValues = [],
        relationValuesBefore = [];
    var scaleValues = [],
        scaleValuesBefore = [];

    var _requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame;

    /**
     * Initialize the function for custom parallax scrolling event
     * with requestAnimationFrame.
     */
    function init() {
        revealer = document.querySelectorAll(SELECTOR_CLASS);
        getViewportHeight();

        initVariables();

        if (revealer.length > 0) {
            draw();
        }
    }

    /**
     * Throttle
     * Throttled version of the passed function.
     * http://underscorejs.org/#throttle
     *
     * @param {function} func
     * @param {number} wait
     * @param {object} options
     *
     * @returns {Function} result
     */
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

    function initVariables() {
        if (revealer.length > 0) {
            for (var i = 0; i < revealer.length; i++) {
                shiftValues[i] = 0;
                shiftValuesBefore[i] = null;
                relationValues[i] = 0;
                relationValuesBefore[i] = null;
                scaleValues[i] = 0;
                scaleValuesBefore[i] = null;
            }
        }
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
        return -(elem.offsetParent.getBoundingClientRect().top);
    }

    /**
     * Returns the value for shift to center element vertically.
     *
     * @param {object} elem
     *
     * @returns {number}
     */
    function setShift(elem) {
        return (viewportHeight - elem.offsetHeight) * .5;
    }

    /**
     * Returns the relation value for scale.
     *
     * @param {object} elem
     *
     * @returns {string}
     */
    function setRelation(elem) {
        return (elem.offsetHeight / viewportHeight).toFixed(3);
    }

    /**
     * Returns the number to set the scale factor.
     *
     * @param {object} elem
     *
     * @returns {number}
     */
    function setScale(elem) {
        return ((1 - elem) * SPEED) + 1;
    }

    /**
    * get viewport height after resizing
    * init the scrollEvent after resizing
    */
    function resizeEvent() {
        getViewportHeight();
        initVariables();
        scrollEvent();
    }

    /**
    * Add the parallax effect to each element.
    * It starts only if element is in viewport and ends when element
    * is out of viewport.
    */
    function scrollEvent(){
        for (var i = 0; i < revealer.length; i++) {
            singleScrollEvent(revealer[i], i);
        }
    }

    function singleScrollEvent(elem, id) {
        // check current position of the element
        var inViewPort = checkPosition(elem);

        // add style for better performance
        if (elem.style.willChange != 'transform') {
            elem.style.willChange = 'transform';
        }

        // in viewport
        if ( (-viewportHeight < inViewPort) &&  (inViewPort < viewportHeight)) {
            
            // shift value to center element vertically
            if (shiftValues[id] != shiftValuesBefore[id]) {
                shiftValues[id] = setShift(elem);
                shiftValuesBefore[id] = shiftValues[id];
                console.log('set');
            }

            // relation needed for scale
            if (relationValues[id] != relationValuesBefore[id]) {
                relationValues[id] = setRelation(elem);
                relationValuesBefore[id] = relationValues[id];
            }

            // SET SCALE 
            if (scaleValues[id] != scaleValuesBefore[id]) {
                scaleValues[id] = setScale(relationValues[id]);
                scaleValuesBefore[id] = scaleValues[id];
            }

            // add class when in viewport revealed
            elem.classList.add('revealed');

            // Scroll value %
            var scrollValue = ((inViewPort + shiftValues[id]) * 100 * SPEED / viewportHeight).toFixed(2);

            // Parallax
            elem.style.transform = 'translate3d(0,' + scrollValue + '%, 0) scale(' + scaleValues[id].toFixed(4) + ')';

        } else {
            // remove class when not in viewport
            elem.classList.remove('revealed');
        }
    }

    /**
     * Adds the requestAnimationFrame for each event (scrolling, resize).
     */
    function draw() {
        // Cutting the mustard
        // http://webfieldmanual.com/guides/cutting-the-mustard.html
        if (window.requestAnimationFrame && document.documentElement.classList) {
            // Passes the test so add enhanced class to HTML tag
            document.documentElement.classList.add('enhanced');

            // Scroll Event
            var scrollHandler = throttle(function() {
                _requestAnimationFrame(scrollEvent);
            }, THROTTLE);

            // Resize Event with higher throttle
            var resizeHandler = throttle(function() {
                _requestAnimationFrame(resizeEvent);
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