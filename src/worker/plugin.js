'use strict';

var Instance = require('./instance');
var HTML_TAG_NAMES = require('runegrid.html-tag-names');
var TAG_PREFIX = ':';

module.exports = function(dsl) {
    var instance = new Instance();

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

    return dsl;
};
