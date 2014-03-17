'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var crumbleValidator = validators.crumbleValidator;
var gju = require('geojson-utils');
var _ = require('lodash-node');

exports.saveCrumble = function (data) {
	var deferred = Q.defer();

	if (crumbleValidator.validateIncomingCrumble(data, deferred)) {
		return deferred.promise;
	}

	var nowMinus5Minutes = new Date().add({
		minutes: -5
	});
	crumbleModel.lastCrumbles(data.entity, nowMinus5Minutes, function (lastCrumbles) {
		var crumble = crumbleModel.create(data);
		var timeCopy = new Date(crumble.time.getTime());
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
				crumbleModel.updateEndtime(lastCrumbleInRange, function (err) {
					if (err) {
						deferred.reject(err);
					}
					deferred.resolve();
				});
				return;
			}
		}

		crumble.endtime = timeCopy;
		crumble.endtime.add({
			minutes: 5
		});

		crumbleModel.save(crumble, function (err) {
			if (err) {
				deferred.reject(err);
			}
			deferred.resolve();
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
				'crumbles.time': -1
			}
		}, {
			$project: {
				entity: 1,
				details: 1,
				time: '$crumbles.time',
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
					$sum: 1
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

exports.getLastLocations = function () {
	var deferred = Q.defer();

	crumbleModel.aggregate(
		[{
			$unwind: '$crumbles'
		}, {
			$sort: {
				'crumbles.time': -1
			}
		}, {
			$group: {
				_id: '$entity',
				time: {
					$first: '$crumbles.time'
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
				time: 1,
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