'use strict';

var RUNIQ_SOURCE_NAME = 'runiq-source';
var ERROR_NAME = 'error';
var PROCESS_TICK = 16;

function Context(element, renderer, worker) {
    this.element = element;
    this.renderer = renderer;
    renderer.attachContext(this);

    this.worker = worker;
    this.worker.onmessage = handler(this);

    this.counter = 0;
    this.ready = [];
    this.pending = [];
    this.listeners = [];
    this.process();
}

Context.prototype.render = function(id, name, payload, via) {
    return this.renderer.render(id, name, payload, via);
};

function handler(context) {
    return function handlerCallback(event) {
        return context.handle(event);
    };
}

Context.prototype.listen = function(fn) {
    this.listeners.push(fn);
};

Context.prototype.handle = function(event) {
    return this.delegate(
        event.data.id,
        event.data.name,
        event.data.payload,
        event.data.via,
        event.data.state,
        event.data.output
    );
};

Context.prototype.delegate = function(id, name, payload, via, state, outputs) {
    for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];
        listener(id, name, payload, via, state, outputs);
    }
    if (name === ERROR_NAME) console.error(payload);
    if (via !== RUNIQ_SOURCE_NAME) {
        if (payload.render) {
            this.render(id, name, payload.render, via);
        }
    }
    return this.pending.pop();
};

Context.prototype.process = function() {
    var ready = this.ready;
    var pending = this.pending;
    var worker = this.worker;
    return window.setInterval(function processInterval() {
        if (pending.length > 0) return;
        var next = ready.shift();
        if (next) {
            worker.postMessage(next);
            pending.push(next);
        }
        return;
    }, PROCESS_TICK);
};

Context.prototype.send = function(name, payload) {
    return this.ready.push({
        id: this.counter++,
        name: name,
        payload: payload
    });
};

Context.prototype.initializeMount = function() {
    return this.renderer.mountElement(this.element);
};

Context.prototype.updateScript = function(script) {
    return this.send(RUNIQ_SOURCE_NAME, script);
};

module.exports = Context;
