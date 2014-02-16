'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var zoneSchema = new Schema({
	entity: {
		type: ObjectId
	},
	loc: {
		type: [Number],
		index: '2d'
	},
	updated: {
		type: Date,
		default: Date.now
	}
});

var Zone = mongoose.model('zone', zoneSchema);

exports.find = function (query, callback) {
	Zone.find(query, function (err, zones) {
		callback(err, zones);
	});
};