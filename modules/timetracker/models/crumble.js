'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
require('date-utils');

var crumbleSchema = new Schema({
	entity: ObjectId,
	details: Schema.Types.Mixed,
	date: Date,
	crumbles: [{
		loc: {
			type: [Number],
			index: '2d'
		},
		time: Date,
		endtime: Date,
		counter: Number
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
				time: crumbleData.time,
				endtime: crumbleData.endtime,
				counter: crumbleData.counter
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
	var today = Date.UTCtoday();
	var now = new Date();

	return {
		entity: data.entity,
		details: data.details,
		date: today,
		loc: data.loc,
		time: now,
		counter: 1
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

exports.lastCrumbles = function (entity, time, callback, failedCallback) {
	Crumble.aggregate(
		[{
			$sort: {
				'crumbles.endtime': -1
			}
		}, {
			$match: {
				'entity': entity,
				'crumbles.endtime': {
					$gte: time
				}
			}
		}, {
			$unwind: '$crumbles'
		}, {
			$project: {
				entity: 1,
				details: 1,
				time: '$crumbles.time',
				endtime: '$crumbles.endtime',
				loc: '$crumbles.loc',
				crumbleId: '$crumbles._id'
			}
		}]).exec(
		function (err, result) {
			if (err) {
				failedCallback(err);
			} else {
				callback(result);
			}
		});
};

exports.updateEndtime = function (crumbleData, callback) {
	Crumble.update({
		'crumbles._id': mongoose.Types.ObjectId('' + crumbleData.crumbleId)
	}, {
		$set: {
			details: crumbleData.details,
			'crumbles.0.endtime': crumbleData.endtime
		},
		$inc: {
			'crumbles.0.counter': 1
		}
	}, function (err) {
		callback(err);
	});
};