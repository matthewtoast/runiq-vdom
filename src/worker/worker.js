'use strict';

var CloneDeep = require('lodash.clonedeep');
var RuniqParser = require('runiq/parser');
var RuniqInterpreter = require('runiq/interpreter');
var RuniqLib = require('runiq/lib');
var RuniqDSL = require('runiq/dsl');

var lib = RuniqLib();
var dsl = new RuniqDSL(lib);
var plugin = require('./plugin');
plugin(dsl);
var interpreter = new RuniqInterpreter(dsl.exportLibrary(), { doWarnOnImpureFunctions: false });
var ast = [];

function runiq(name, payload, cb) {
    var event = { name: name, payload: payload };
    var clone = CloneDeep(ast);
    return interpreter.run(clone, [], event, cb);
}

var handlers = {};

handlers['runiq-source'] = function runiqSourceFunction(payload, cb) {
    try {
        var tokens = RuniqParser.lex(payload);
        ast = RuniqParser.parse(tokens);
        return cb(null, ast);
    }
    catch (e) {
        return cb(e);
    }
};

function responder(id, name) {
    return function responderCallback(err, result) {
        if (err) {
            return send(id, name, 'error', err.message);
        }
        return send(id, name, 'response', result);
    };
}

function send(id, via, name, payload) {
    return postMessage({
        id: id,
        via: via,
        name: name,
        payload: payload,
        output: interpreter.output(true),
        state: JSON.parse(JSON.stringify(interpreter.state()))
    });
}

function handler(id, name, payload, original) {
    var cb = responder(id, name);
    if (handlers[name]) {
        return handlers[name](payload, cb);
    }
    return runiq(name, payload, cb);
}

onmessage = function onMessageFunction(event) {
    return handler(
        event.data.id,
        event.data.name,
        event.data.payload,
        event
    );
};
