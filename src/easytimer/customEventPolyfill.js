/*
* Polyfill por IE9, IE10 and IE11
*/
var CustomEvent = typeof window !== 'undefined' ? window.CustomEvent : undefined;

if (typeof window !== 'undefined' && typeof CustomEvent !== 'function') {
  CustomEvent = function (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}
