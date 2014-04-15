'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var activitySchema = new Schema({
	activity: ObjectId,
	activityDetails: Schema.Types.Mixed,
	active: Boolean,
	activeSince: {
		type: Date,
		default: Date.now
	}
});

var zoneSchema = new Schema({
	entity: ObjectId,
	loc: {
		type: [Number],
		index: '2d'
	},
	zoneDetails: Schema.Types.Mixed,
	activities: [activitySchema]
});

mongoose.model('activity', activitySchema);
var Zone = mongoose.model('zone', zoneSchema);

exports.find = function (query, callback) {
	Zone.find(query, function (err, zones) {
		callback(err, zones);
	});
};

exports.aggregate = function (aggregate, callback) {
	Zone.aggregate(aggregate).exec(callback);
};

exports.create = function (data) {
	return {
		_id: data.zone,
		entity: data.entity,
		loc: data.loc,
		zoneDetails: data.zoneDetails,
		activity: data.activity,
		activityDetails: data.activityDetails,
		active: true,
		activeSince: new Date()
	};
};

exports.save = function (zoneData, callback) {
	Zone.update({
		entity: zoneData.entity,
		loc: zoneData.loc
	}, {
		$push: {
			activities: {
				activity: zoneData.activity,
				activityDetails: zoneData.activityDetails,
				active: zoneData.active,
				activeSince: zoneData.activeSince
			}
		},
		$set: {
			zoneDetails: zoneData.zoneDetails
		}
	}, {
		upsert: true
	}, function (err) {
		callback(err);
	});
};

exports.updateZone = function (zoneData, callback) {
	Zone.update({
		_id: zoneData._id
	}, {
		$set: {
			zoneDetails: zoneData.zoneDetails
		}
	}, function (err) {
		callback(err);
	});
};

exports.findZoneWithin30Meters = function (zoneData, callback) {
	Zone.aggregate(
		[{
			$geoNear: {
				near: [parseFloat(zoneData.loc[0]), parseFloat(zoneData.loc[1])],
				distanceField: 'dist.calculated',
				maxDistance: 0.0003, // 30 meters
				query: {
					entity: mongoose.Types.ObjectId('' + zoneData.entity)
				},
				includeLocs: 'dist.location',
				uniqueDocs: true,
				num: 5
			}
		}],
		callback);
};

exports.removeActivityFromZone = function (zoneData, callback) {
	Zone.update({
		_id: zoneData.zone,
	}, {
		$pull: {
			activities: {
				activity: zoneData.activity,
			}
		}
	}, function (err) {
		callback(err);
	});
};

exports.addActivityToZone = function (zone, activityData, callback) {
	Zone.update({
		_id: zone,
		'activities.active': true
	}, {
		$set: {
			'activities.$.active': false,
		}
	}, function (err) {
		if (err) {
			callback(err);
			return;
		}
		Zone.update({
			_id: zone
		}, {
			$push: {
				activities: {
					activity: activityData.activity,
					activityDetails: activityData.activityDetails,
					active: activityData.active,
					activeSince: activityData.activeSince
				}
			}
		}, function (err) {
			callback(err);
		});
	});
};

exports.setActivityActiveInZone = function (zone, activity, callback) {
	Zone.update({
		_id: zone,
		'activities.active': true
	}, {
		$set: {
			'activities.$.active': false,
		}
	}, function (err) {
		if (err) {
			callback(err);
			return;
		}
		Zone.update({
			_id: zone,
			'activities.activity': activity
		}, {
			$set: {
				'activities.$.active': true,
			}
		}, function (err) {
			callback(err);
		});
	});
};

exports.getById = function (id, callback) {
	Zone.findById(id).exec(callback);
};

exports.updateAndSetActivityActiveInZone = function (zone, data, callback) {
	Zone.update({
		_id: zone,
		'activities.active': true
	}, {
		$set: {
			'activities.$.active': false,
		}
	}, function (err) {
		if (err) {
			callback(err);
			return;
		}

		Zone.update({
			_id: zone,
			'activities.activity': data.activity
		}, {
			$set: {
				'activities.$.active': true,
				'activities.$.activityDetails': data.activityDetails
			}
		}, function (err) {
			callback(err);
		});
	});
};