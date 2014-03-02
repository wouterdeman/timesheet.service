'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var crumbleValidator = validators.crumbleValidator;

exports.saveCrumble = function (data) {
	var deferred = Q.defer();

	if (crumbleValidator.validateIncomingCrumble(data, deferred)) {
		return deferred.promise;
	}

	var crumble = crumbleModel.create(data);
	crumbleModel.save(crumble, function (err) {
		if (err) {
			deferred.reject(err);
		}
		deferred.resolve();
	});

	return deferred.promise;
};

exports.getTodaysCrumbles = function (data) {
	var deferred = Q.defer();

	if (crumbleValidator.hasEntity(data, deferred)) {
		return deferred.promise;
	}

	crumbleModel.find({
		entity: data.entity,
		date: Date.today()
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
				loc: {
					$first: '$crumbles.loc'
				},
				details: {
					$first: '$details'
				}
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