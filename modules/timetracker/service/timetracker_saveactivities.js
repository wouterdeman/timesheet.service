'use strict';

var models = require('../models');
var zoneModel = models.zoneModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var zoneValidator = validators.zoneValidator;
var _ = require('lodash-node');

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