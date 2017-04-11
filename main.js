"use strict";

var blink = require('./Blink.js');

function NotifyBlink(options) {

	this.failOpts = {
		hex: options.successHex || '#ff33cc',
		repeats: options.successCount || 3
	}

	this.successOpts = {
		hex: options.successHex || '#66ff66',
		repeats: options.successCount || 3
	}
}

NotifyBlink.prototype.apply = function(compiler) {

	compiler.plugin('done', function(compilation) {
		if (compilation.errors &&  compilation.errors.length) {
			return blink.blink(this.failOpts);
		}

		return blink.blink(this.successOpts);
	}.bind(this));

};

module.exports = NotifyBlink;
