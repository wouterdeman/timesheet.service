'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var crumbleValidator = validators.crumbleValidator;

exports.getTodaysCrumbles = function (data) {
    var deferred = Q.defer();

    if (crumbleValidator.hasEntity(data, deferred)) {
        return deferred.promise;
    }

    crumbleModel.findOne({
        entity: data.entity,
        date: Date.UTCtoday()
    }).then(deferred.resolve, deferred.reject);

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
        }]).then(deferred.resolve, deferred.reject);

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
        }]).then(function (result) {
            deferred.resolve(result[0].count);
        }, deferred.reject);

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
        }]).then(function (result) {
            deferred.resolve(result[0].duration);
        }, deferred.reject);

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
        }]).then(deferred.resolve, deferred.reject);

    return deferred.promise;
};