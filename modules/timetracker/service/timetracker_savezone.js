'use strict';

var models = require('../models');
var zoneModel = models.zoneModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var zoneValidator = validators.zoneValidator;
var _ = require('lodash-node');

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