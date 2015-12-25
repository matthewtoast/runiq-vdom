'use strict';

var Assign = require('lodash.assign');
var CSSQueryObject = require('runegrid.css-query-object');

var BLANK = '';
var OBJECT_TYPE = 'object';
var CQO_PROP_MAP = {
    name: 'name',
    attributes: 'attributes',
    children: 'children'
};

function Instance() {
}

Instance.prototype.vdom = function(context) {
    var children = _buildRender([], context.args);
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

Instance.prototype.style = function(context) {
    var styleSets = context.args;
    var styleHash = {};
    for (var i = 0; i < styleSets.length; i++) {
        var styleSet = styleSets[i];
        var selector = styleSet.shift();
        if (!styleHash[selector]) styleHash[selector] = {};
        for (var j = 0; j < styleSet.length; j += 2) {
            styleHash[selector][styleSet[j]] = styleSet[j + 1];
        }
    }
    var finalStyle = { style: styleHash };
    return context.cb(null, finalStyle);
};

function _buildRender(children, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            _buildRender(children, arr[i]);
            continue;
        }
        if (!arr[i]) continue;
        // Handle .style() return values
        if (arr[i].style) {
            var style = arr[i].style;
            arr.splice(i); // Style object is not an element
            _applyStyle(style, arr);
            continue;
        }
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

function _applyStyle(style, arr) {
    var top = { name: '__top__', children: arr, attributes: {} };
    for (var selector in style) {
        var elements = CSSQueryObject([], top, selector, CQO_PROP_MAP);
        if (elements.length < 1) continue;
        var rule = style[selector];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (!element.attributes.style) element.attributes.style = {};
            var appliedStyle = element.attributes.style;
            for (var property in rule) {
                var value = rule[property];
                if (typeof value === 'number') value = value + 'px';
                appliedStyle[property] = value;
            }
        }
    }
}

module.exports = Instance;
