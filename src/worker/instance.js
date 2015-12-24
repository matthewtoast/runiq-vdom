'use strict';

var Assign = require('lodash.assign');

var BLANK = '';
var OBJECT_TYPE = 'object';

function Instance() {
}

Instance.prototype.vdom = function(context) {
    var children = _buildChildren([], context.args);
    return context.cb(null, { render: {
        name: 'div',
        children: children
    }});
};

Instance.prototype.element = function(context) {
    var tagName = context.name.slice(1); // Strip leading ':'
    var elementObject = _buildElementObject(tagName, context.args);
    return context.cb(null, elementObject);
};

function _buildChildren(children, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            _buildChildren(children, arr[i]);
            continue;
        }
        if (!arr[i]) continue;
        // Handle nested .vdom() return values
        if (arr[i].render) {
            children.push(arr[i].render);
            continue;
        }
        children.push(arr[i]);
    }
    return children;
}

function _buildElementObject(name, facets) {
    var content = BLANK;
    var attributes = {};
    var children = [];

    for (var i = 0; i < facets.length; i++) {
        var facet = facets[i];
        if (!facet) continue;

        if (Array.isArray(facet)) {
            children = children.concat(facet);
            continue;
        }
        if (typeof facet === OBJECT_TYPE) {
            // Infer that this is actually a child
            // object by looking at the facet's props
            if (facet.attributes) {
                children = children.concat(facet);
            }
            else {
                Assign(attributes, facet);
            }
            continue;
        }
        content = content + facet;
        continue;
    }

    return {
        name: name,
        content: content,
        attributes: attributes,
        children: children
    };
}

module.exports = Instance;
