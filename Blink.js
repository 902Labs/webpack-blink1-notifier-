"use strict";

var Blink1 = require('node-blink1');
var parsecolor = require('parse-color');

var devices = Blink1.devices(); // returns array of serial numbers
var blink1 = devices.length ? new Blink1() : null;

var lastColor = '#000000';
var lastTime = 0;
var lastLedn = 0;
var lastRepeats = 0;

// rescan if we know we have no blink1
function blink1TryConnect() {
	if (blink1) {
		return;
	}

	devices = Blink1.devices();

	if (devices.length) {
		blink1 = new Blink1();
	}
}

// Call blink1.fadeToRGB while dealing with disconnect / reconnect of blink1
function send(millis, r, g, b, ledn) {

	blink1TryConnect();

	if (!blink1) {
		return "no blink1 device found";
	}

	try {
		blink1.fadeToRGB( millis, r, g, b, ledn );
	} catch(err) {
		blink1 = null;
		return ""+err;
	}

	return "success";
}

function runBlink(repeats, millis, r, g, b, ledn) {
	var results = send(millis/2, r, g, b, ledn);

	// Setup Off Switch
	setTimeout(function() {
		var resultsOff = send(millis/2, 0, 0, 0, ledn);
	}, millis);

	if (repeats > 1) {
		setTimeout(function() {
			runBlink((repeats-1), millis, r, g, b, ledn);
		}, millis*2);
	}
}

function off(opts) {
	var millis = opts && opts.time || .1;

	send(millis/2, 0, 0, 0, 1);
	send(millis/2, 0, 0, 0, 2);
}


function blink(opts) {
	var color = parsecolor(opts.hex);
	var rgb = color && color.rgb;
	var time = opts && opts.time || .1;
	var ledn = opts && opts.ledn || 2;

	var repeats = opts && opts.repeats || 1;


	if (!rgb) {
		throw new Error('bad hex color specified ' + opts.hex, color);
	}

	const cmd = repeats ? runBlink : fade;
	const args = [time*1000, rgb[0], rgb[1], rgb[2], ledn]

	if (repeats) {
		args.unshift(repeats);
	}

	// Execute Blink1 Command
	cmd.apply({}, args);

	return {
		blink1Connected: blink1 !== null,
		blink1Serials: devices,
		color: color,
		time: time,
		ledn: ledn,
		repeats: repeats
	};
}

module.exports = {
	off: off,
	blink: blink
};
