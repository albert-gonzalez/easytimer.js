function EventEmitter () {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener, id) {
  if (!Array.isArray(this.events[event])) {
    this.events[event] = [];
  }
  this.events[event].push({ listener, id });

  return () => this.removeListener(event, listener);
};

EventEmitter.prototype.removeListener = function (event, listener) {
  if (Array.isArray(this.events[event])) {
    const eventIndex = this.events[event].findIndex((eventListener) => eventListener.listener === listener);
    if (eventIndex > -1) {
      this.events[event].splice(eventIndex, 1);
    }
  }
};

EventEmitter.prototype.removeListenerByID = function (event, id) {
  if (Array.isArray(this.events[event])) {
    const eventIndex = this.events[event].findIndex((eventListener) => eventListener.id === id);
    if (eventIndex > -1) {
      this.events[event].splice(eventIndex, 1);
    }
  }
};

EventEmitter.prototype.emit = function (event, ...args) {
  if (Array.isArray(this.events[event])) {
    this.events[event].forEach(({ listener }) => listener.apply(this, args));
  }
};

export default EventEmitter;
