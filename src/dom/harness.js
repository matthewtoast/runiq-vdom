'use strict';

var DOMReady = require('domready');
var Context = require('./context');
var Renderer = require('./renderer');

var WORKER_NAME = 'runiq-vdom-worker.js';

(function domHarnessCallback() {
    var scriptElements = document.getElementsByTagName('script');
    var thisScriptElement = scriptElements[scriptElements.length - 1];
    var thisScriptData = thisScriptElement.innerHTML;

    return DOMReady(function domReadyCallback() {
        var element = thisScriptElement.parentNode;
        var script = thisScriptData;
        var renderer = new Renderer();
        var worker = new Worker(WORKER_NAME);
        var context = new Context(element, renderer, worker);
        context.initializeMount();
        context.updateScript(script);
        context.send('run', {});
    });
}());
