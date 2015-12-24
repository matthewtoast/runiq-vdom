'use strict';

module.exports = {
    DOMContext: require('./src/dom/context'),
    DOMRenderer: require('./src/dom/renderer'),
    RenderInstance: require('./src/worker/instance'),
    Plugin: require('./src/worker/plugin'),
    Worker: require('./src/worker/worker')
};
