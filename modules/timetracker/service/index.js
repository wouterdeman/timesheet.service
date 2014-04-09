'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var objectTrackingModel = models.objectTrackingModel;
var zoneModel = models.zoneModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var crumbleValidator = validators.crumbleValidator;
var zoneValidator = validators.zoneValidator;
var gju = require('geojson-utils');
var _ = require('lodash-node');

var checkIfWeHaveCrumblesInRangeAndUpdate = function (deferred, crumble, lastCrumbles, timeCopy, objectTracking, zone) {
	if (lastCrumbles && lastCrumbles.length) {
		var lastCrumbleInRange = _.find(lastCrumbles, function (lastCrumble) {
			var distance = gju.pointDistance({
				type: 'Point',
				coordinates: lastCrumble.loc
			}, {
				type: 'Point',
				coordinates: crumble.loc
			});

			return distance < 30;
		});

		if (lastCrumbleInRange) {
			lastCrumbleInRange.endtime = timeCopy;
			lastCrumbleInRange.duration = lastCrumbleInRange.endtime.getTime() - lastCrumbleInRange.starttime.getTime();
			lastCrumbleInRange.object = objectTracking.object;
			lastCrumbleInRange.objectdetails = objectTracking.details;

			//TODO: check if we are updating for the same zone/activity/object

			if (zone) {
				lastCrumbleInRange.zone = zone._id;
				lastCrumbleInRange.zoneDetails = zone.zoneDetails;
				var activeActivity = _.find(zone.activities, {
					'active': true
				});
				lastCrumbleInRange.activity = activeActivity._id;
				lastCrumbleInRange.activityDetails = activeActivity.activityDetails;
			}
			crumbleModel.updateEndtime(lastCrumbleInRange, function (err) {
				if (err) {
					deferred.reject(err);
				}
				deferred.resolve();
			});
			return true;
		}
	}
	return false;
};

var saveNewCrumble = function (deferred, crumble, timeCopy, objectTracking, zone) {
	crumble.endtime = timeCopy;
	crumble.endtime.add({
		minutes: 5
	});
	crumble.duration = crumble.endtime.getTime() - crumble.starttime.getTime();
	crumble.object = objectTracking.object;
	crumble.objectdetails = objectTracking.details;
	if (zone) {
		crumble.zone = zone._id;
		crumble.zoneDetails = zone.zoneDetails;
		var activeActivity = _.find(zone.activities, {
			'active': true
		});
		crumble.activity = activeActivity._id;
		crumble.activityDetails = activeActivity.activityDetails;
	}

	crumbleModel.save(crumble, function (err) {
		if (err) {
			deferred.reject(err);
		}
		deferred.resolve();
	});
};

exports.saveCrumble = function (data) {
	var deferred = Q.defer();

	if (crumbleValidator.validateIncomingCrumble(data, deferred)) {
		return deferred.promise;
	}

	var nowMinus10Minutes = new Date().add({
		minutes: -10
	});

	crumbleModel.lastCrumbles(data.entity, nowMinus10Minutes, function (lastCrumbles) {
		var crumble = crumbleModel.create(data);
		var objectTracking = objectTrackingModel.create(data);
		var timeCopy = new Date(crumble.starttime.getTime());
		zoneModel.findZoneWithin30Meters(data, function (err, result) {
			if (err) {
				deferred.reject(err);
				return;
			}

			var zone;
			if (result.length) {
				zone = result[0];
			}

			var crumbleDataSaved = Q.defer();

			if (!checkIfWeHaveCrumblesInRangeAndUpdate(crumbleDataSaved, crumble, lastCrumbles, timeCopy, objectTracking, zone)) {
				saveNewCrumble(crumbleDataSaved, crumble, timeCopy, objectTracking, zone);
			}

			var crumbleDataSavedPromise = crumbleDataSaved.promise;

			crumbleDataSavedPromise.then(function () {
				objectTrackingModel.save(objectTracking, function (err) {
					if (err) {
						deferred.reject(err);
					}
					deferred.resolve();
				});
			}).fail(deferred.reject);
		});
	}, deferred.reject);

	return deferred.promise;
};

exports.getTodaysCrumbles = function (data) {
	var deferred = Q.defer();

	if (crumbleValidator.hasEntity(data, deferred)) {
		return deferred.promise;
	}

	var today = Date.UTCtoday();

	crumbleModel.find({
		entity: data.entity,
		date: today
	}, function (err, result) {
		if (err) {
			deferred.reject(err);
		}
		if (result[0]) {
			deferred.resolve(result[0]);
		} else {
			deferred.resolve(null);
		}
	});

	return deferred.promise;
};

exports.getLast10Crumbles = function () {
	var deferred = Q.defer();

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$sort: {
				'crumbles.endtime': -1
			}
		}, {
			$project: {
				entity: 1,
				details: 1,
				starttime: '$crumbles.starttime',
				endtime: '$crumbles.endtime',
				loc: '$crumbles.loc'
			}
		}, {
			$limit: 10
		}], function (err, result) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(result);
			}
		});

	return deferred.promise;
};

exports.getTotalCountOfCrumbles = function () {
	var deferred = Q.defer();

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$group: {
				_id: null,
				count: {
					$sum: '$crumbles.counter'
				}
			}
		}, {
			$project: {
				_id: 0,
				count: 1
			}
		}],
		function (err, result) {
			if (err || !result) {
				deferred.reject(err);
			} else {
				deferred.resolve(result[0].count);
			}
		});

	return deferred.promise;
};

exports.getTotalTrackedTime = function () {
	var deferred = Q.defer();

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$group: {
				_id: null,
				duration: {
					$sum: '$crumbles.duration'
				}
			}
		}, {
			$project: {
				_id: 0,
				duration: 1
			}
		}],
		function (err, result) {
			if (err || !result) {
				deferred.reject(err);
			} else {
				deferred.resolve(result[0].duration);
			}
		});

	return deferred.promise;
};

exports.getLastLocations = function () {
	var deferred = Q.defer();

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$sort: {
				'crumbles.endtime': -1
			}
		}, {
			$group: {
				_id: '$entity',
				starttime: {
					$first: '$crumbles.starttime'
				},
				endtime: {
					$first: '$crumbles.endtime'
				},
				loc: {
					$first: '$crumbles.loc'
				},
				details: {
					$first: '$details'
				}
			}
		}, {
			$project: {
				_id: 0,
				entity: '$_id',
				starttime: 1,
				endtime: 1,
				loc: 1,
				details: 1
			}
		}],
		function (err, result) {
			if (err || !result) {
				deferred.reject(err);
			} else {
				deferred.resolve(result);
			}
		});
	return deferred.promise;
};

exports.saveZone = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.validateRequiredZoneData(data, deferred)) {
		return deferred.promise;
	}

	var zone = zoneModel.create(data);

	zoneModel.save(zone, function (err) {
		if (err) {
			deferred.reject(err);
		}
		deferred.resolve();
	});

	return deferred.promise;
};

exports.getActiveActivity = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.hasEntity(data, deferred)) {
		return deferred.promise;
	}

	zoneModel.findZoneWithin30Meters(data, function (err, result) {
		if (err || !result) {
			deferred.reject(err);
			return;
		}

		var activeActivity;
		if (result.length && result[0].activities.length) {
			var zone = result[0];
			activeActivity = _.find(zone.activities, function (activity) {
				return activity.active;
			});
			activeActivity.zoneDetails = zone.zoneDetails;
		}
		deferred.resolve(activeActivity);
	});

	return deferred.promise;
};

exports.removeActivityFromZone = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.validateRequiredZoneData(data, deferred)) {
		return deferred.promise;
	}

	zoneModel.findZoneWithin30Meters(data, function (err, result) {
		if (err || !result) {
			deferred.reject(err);
			return;
		}
		if (result.length) {
			zoneModel.removeActivityFromZone({
				zone: result[0]._id,
				activity: data.activity
			}, function (err) {
				if (err) {
					deferred.reject(err);
					return;
				}
				deferred.resolve();
			});
		}
	});

	return deferred.promise;
};

exports.addActivityToZone = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.validateRequiredZoneData(data, deferred)) {
		return deferred.promise;
	}

	zoneModel.findZoneWithin30Meters(data, function (err, result) {
		if (err || !result) {
			deferred.reject(err);
			return;
		}

		if (result.length) {
			var zone = result[0];

			var activityAlreadyExists = _.find(zone.activities, {
				'activity': data.activity
			});

			if (activityAlreadyExists) {
				zoneModel.setActivityActiveInZone(zone._id, data.activity, function (err) {
					if (err) {
						deferred.reject(err);
						return;
					}
					deferred.resolve();
				});
			} else {
				var newActivityAndZone = zoneModel.create(data);

				zoneModel.addActivityToZone(zone._id, newActivityAndZone, function (err) {
					if (err) {
						deferred.reject(err);
						return;
					}
					deferred.resolve();
				});
			}
		}
	});

	return deferred.promise;
};

exports.setActivityActiveInZone = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.validateRequiredZoneData(data, deferred)) {
		return deferred.promise;
	}

	zoneModel.findZoneWithin30Meters(data, function (err, result) {
		if (err || !result) {
			deferred.reject(err);
			return;
		}

		if (result.length) {
			zoneModel.setActivityActiveInZone(result[0]._id, data.activity, function (err) {
				if (err) {
					deferred.reject(err);
					return;
				}
				deferred.resolve();
			});
		}
	});

	return deferred.promise;
};

exports.getZoneAndActivities = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.hasEntity(data, deferred)) {
		return deferred.promise;
	}

	zoneModel.findZoneWithin30Meters(data, function (err, result) {
		if (err || !result) {
			deferred.reject(err);
			return;
		}

		var zone;
		if (result.length) {
			zone = result[0];
		}
		deferred.resolve(zone);
	});

	return deferred.promise;
};

exports.getMapsShowCase = function () {
	var deferred = Q.defer();

	var nowMinus1Month = new Date().add({
		months: -1
	});

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$sort: {
				'crumbles.starttime': 1
			}
		}, {
			$match: {
				'crumbles.starttime': {
					$gte: nowMinus1Month
				}
			}
		}, {
			$project: {
				_id: 0,
				starttime: '$crumbles.starttime',
				endtime: '$crumbles.endtime',
				loc: '$crumbles.loc',
				details: 1,
				duration: '$crumbles.duration',
				counter: '$crumbles.counter'
			}
		}],
		function (err, result) {
			if (err || !result) {
				deferred.reject(err);
			} else {
				deferred.resolve(result);
			}
		});
	return deferred.promise;
};

exports.updateZone = function (data) {
	var deferred = Q.defer();

	if (zoneValidator.validateRequiredZoneData(data, deferred) && zoneValidator.validateRequiredZoneId(data, deferred)) {
		return deferred.promise;
	}

	var zone = zoneModel.create(data);

	zoneModel.updateZone(zone, function (err) {
		if (err) {
			deferred.reject(err);
		}

		zoneModel.getById(data.zone, function (err, zone) {
			if (err || !zone) {
				deferred.reject(err);
				return;
			}

			var activityAlreadyExists = _.find(zone.activities, {
				'activity': data.activity
			});

			if (activityAlreadyExists) {
				zoneModel.updateAndSetActivityActiveInZone(zone._id, data, function (err) {
					if (err) {
						deferred.reject(err);
						return;
					}
					console.log('done updateAndSetActivityActiveInZone');
					deferred.resolve();
				});
			} else {
				var newActivityAndZone = zoneModel.create(data);

				zoneModel.addActivityToZone(zone._id, newActivityAndZone, function (err) {
					if (err) {
						deferred.reject(err);
						return;
					}
					deferred.resolve();
				});
			}
		});
	});

	return deferred.promise;
};