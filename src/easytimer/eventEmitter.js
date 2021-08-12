function EventEmitter () {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (!Array.isArray(this.events[event])) {
    this.events[event] = [];
  }
  this.events[event].push(listener);

  return () => this.removeListener(event, listener);
};

EventEmitter.prototype.removeListener = function (event, listener) {
  if (Array.isArray(this.events[event])) {
    const eventIndex = this.events[event].indexOf(listener);
    if (eventIndex > -1) {
      this.events[event].splice(eventIndex, 1);
    }
  }
};

EventEmitter.prototype.removeAllListeners = function (event) {
  if (!event) {
    this.events = {};
  } else if (Array.isArray(this.events[event])) {
    this.events[event] = [];
  }
};

EventEmitter.prototype.emit = function (event, ...args) {
  if (Array.isArray(this.events[event])) {
    this.events[event].forEach(listener => listener.apply(this, args));
  }
};

export default EventEmitter;
