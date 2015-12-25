'use strict'

var H = require('virtual-dom/h');
var Diff = require('virtual-dom/diff');
var Patch = require('virtual-dom/patch');
var CreateElement = require('virtual-dom/create-element');

var DEPRECATED_PROPS = {
    'webkitMovementX': true,
    'webkitMovementY': true,
    'keyLocation': true
};

var UNSERIALIZABLE_TYPES = {
    'object': true,
    'function': true
};

var EVENT_ATTR_PREFIX = 'on';

function Renderer() {
    this.element = null;
    this.context = null;
    this.previous = null;
    this.root = null;
}

function _descend(children, ctx, inst) {
    var out = [];
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        out.push(_render(child, ctx, inst));
    }
    return out;
}

function _synthesizeEvent(rawEvent, inst) {
    var syntheticEvent = {};
    if (rawEvent.target) {
        syntheticEvent.target = _synthesizeEvent(rawEvent.target);
    }
    for (var propName in rawEvent) {
        if (!(propName in DEPRECATED_PROPS)) {
            var propValue = rawEvent[propName];
            if (!((typeof propValue) in UNSERIALIZABLE_TYPES)) {
                syntheticEvent[propName] = propValue;
            }
        }
    }
    return syntheticEvent;
}

function _processProperties(obj, ctx, inst) {
    var out = {};
    if (obj.id) out.id = obj.id;
    var attrs = obj.attributes || {};
    // HACK: I don't remember why this is needed, but removing
    // this condition causes the styles not to render... :(
    if (attrs.style) {
        // If attrs.style is a string (cssText), leave it alone
        // and it will be automatically applied as style
        if (typeof attrs.style === 'object') {
            out.style = attrs.style;
            delete attrs.style;
        }
    }
    for (var name in attrs) {
        if (name.slice(0, 2) === EVENT_ATTR_PREFIX) {
            var message = attrs[name];
            delete attrs[name];
            out[name] = function(event) {
                var syntheticEvent = _synthesizeEvent(event, inst)
                ctx.send(message, syntheticEvent);
            };
        }
    }
    out.attributes = attrs;
    return out;
}

function _render(obj, ctx, inst) {
    var innerPieces = [].concat(obj.content, _descend(obj.children, ctx, inst));
    var virtualProps = _processProperties(obj, ctx, inst);
    var virtualEl = H(obj.name, virtualProps, innerPieces);
    return virtualEl;
}

Renderer.prototype.render = function(id, name, payload, via) {
    var tree = _render(payload, this.context, this);

    if (this.root) {
        var patches = Diff(this.previous, tree);
        this.root = Patch(this.root, patches);
    }
    else {
        this.root = CreateElement(tree);
        this.element.appendChild(this.root);
    }

    this.previous = tree;
};

Renderer.prototype.mountElement = function(element) {
    this.element = element;
};

Renderer.prototype.attachContext = function(context) {
    this.context = context;
};

module.exports = Renderer;
