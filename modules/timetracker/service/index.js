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
			deferred.resolve(result[0].crumbles);
		} else {
			deferred.resolve(null);
		}
	});

	return deferred.promise;
};