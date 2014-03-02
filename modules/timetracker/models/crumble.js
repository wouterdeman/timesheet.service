'use strict';

require('date-utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crumbleSchema = new Schema({
	entity: ObjectId,
	details: Schema.Types.Mixed,
	date: {
		type: Date
	},
	crumbles: [{
		loc: {
			type: [Number],
			index: '2d'
		},
		time: {
			type: Date
		}
	}]
});

var Crumble = mongoose.model('crumble', crumbleSchema);

exports.save = function (crumbleData, callback) {
	Crumble.update({
		entity: crumbleData.entity,
		date: crumbleData.date
	}, {
		$push: {
			crumbles: {
				loc: crumbleData.loc,
				time: crumbleData.time
			}
		},
		$set: {
			details: crumbleData.details
		}
	}, {
		upsert: true
	}, function (err) {
		callback(err);
	});
};

exports.create = function (data) {
	return {
		entity: data.entity,
		details: data.details,
		date: Date.today(),
		loc: data.loc,
		time: new Date()
	};
};

exports.find = function (query, callback) {
	Crumble.find(query, function (err, crumbles) {
		callback(err, crumbles);
	});
};

exports.aggregate = function (aggregate, callback) {
	Crumble.aggregate(aggregate).exec(callback);
};