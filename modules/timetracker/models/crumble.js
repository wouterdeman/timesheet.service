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
		starttime: Date,
		endtime: Date,
		counter: Number,
		duration: Number,
		object: String,
		objectdetails: Schema.Types.Mixed,
		zone: ObjectId,
		zoneDetails: Schema.Types.Mixed,
		activity: ObjectId,
		activityDetails: Schema.Types.Mixed
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
				starttime: crumbleData.starttime,
				endtime: crumbleData.endtime,
				counter: crumbleData.counter,
				duration: crumbleData.duration,
				object: crumbleData.object,
				objectdetails: crumbleData.objectdetails,
				zone: crumbleData.zone,
				zoneDetails: crumbleData.zoneDetails,
				activity: crumbleData.activity,
				activityDetails: crumbleData.activityDetails
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
		starttime: now,
		counter: 1,
		duration: 0
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
			$unwind: '$crumbles'
		}, {
			$sort: {
				'crumbles.endtime': -1
			}
		}, {
			$match: {
				'entity': mongoose.Types.ObjectId('' + entity),
				'crumbles.endtime': {
					$gte: time
				}
			}
		}, {
			$project: {
				entity: 1,
				details: 1,
				starttime: '$crumbles.starttime',
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
			'crumbles.$.endtime': crumbleData.endtime,
			'crumbles.$.duration': crumbleData.duration,
			'crumbles.$.object': crumbleData.object || '',
			'crumbles.$.objectdetails': crumbleData.objectdetails || {}
		},
		$inc: {
			'crumbles.$.counter': 1
		}
	}, function (err) {
		callback(err);
	});
};

exports.getTrackedTimeForActivity = function (data, callback) {
	Crumble.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$match: {
				'date': {
					$gte: data.from,
					$lte: data.to
				},
				'entity': mongoose.Types.ObjectId('' + data.entity),
				'crumbles.activity': mongoose.Types.ObjectId('' + data.activity)
			}
		}, {
			$group: {
				_id: {
					date: '$date'
				},
				date: {
					$first: '$date'
				},
				duration: {
					$sum: '$crumbles.duration'
				}
			}
		}, {
			$sort: {
				'date': 1
			}
		}, {
			$project: {
				_id: 0,
				date: 1,
				duration: 1
			}
		}]).exec(callback);
};

exports.getTrackedTimeAndActivity = function (data, callback) {
	Crumble.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$match: {
				'date': {
					$gte: data.from,
					$lte: data.to
				},
				'entity': mongoose.Types.ObjectId('' + data.entity)
			}
		}, {
			'$group': {
				_id: {
					date: '$date',
					object: '$crumbles.object'
				},
				date: {
					$first: '$date'
				},
				duration: {
					$sum: '$crumbles.duration'
				},
				object: {
					$first: '$crumbles.object'
				},
				objectdetails: {
					$first: '$crumbles.objectdetails'
				},
				activity: {
					$first: '$crumbles.activity'
				}
			}
		}, {
			$sort: {
				'date': 1
			}
		}, {
			$project: {
				_id: 0,
				date: 1,
				duration: 1,
				object: 1,
				objectdetails: 1,
				activity: 1
			}
		}]).exec(callback);
};

exports.updateCustomerForTrackedTime = function (data, callback) {
	Crumble.update({
		'entity': mongoose.Types.ObjectId('' + data.entity),
		'date': data.date,
		'crumbles.object': data.object
	}, {
		$set: {
			'crumbles.$.activity': mongoose.Types.ObjectId('' + data.activity)
		}
	}, {
		multi: true
	}, function (err) {
		callback(err);
	});
};