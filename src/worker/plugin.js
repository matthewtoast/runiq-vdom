'use strict';

var Instance = require('./instance');
var HTML_TAG_NAMES = require('runegrid.html-tag-names');
var TAG_PREFIX = ':';

module.exports = function(dsl) {
    var instance = new Instance();

    /**
     * Produce a tree object in the VDOM renderer format
     * @function vdom
     * @returns {Hash}
     */
    dsl.defineFunction('vdom', {
        signature: [true,'hash'],
        implementation: function() {
            return instance.vdom(this);
        }
    });

    for (var i = 0; i < HTML_TAG_NAMES.length; i++) {
        var tag = HTML_TAG_NAMES[i];
        dsl.defineFunction(TAG_PREFIX + tag, {
            signature: [true,'hash'],
            implementation: function() {
                return instance.element(this);
            }
        });
    }

    /**
     * Produce a style object in the VDOM renderer format
     * @function style
     * @returns {Hash}
     */
    dsl.defineFunction('style', {
        signature: [true,'hash'],
        implementation: function() {
            return instance.style(this);
        }
    });

    return dsl;
};
