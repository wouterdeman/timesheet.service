'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');
require('date-utils');
var _ = require('lodash-node');

exports.updateActivityForTrackedTime = function (data) {
    var deferred = Q.defer();

    crumbleModel.updateActivityForTrackedTime(data, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
};

exports.copyTrackedTimeByCrumbleReference = function (data) {
    var deferred = Q.defer();

    crumbleModel.getCrumbleById(data.reference, function (err, crumble) {
        if (err) {
            deferred.reject(err);
        } else {
            var referencedCrumble = _.find(crumble.crumbles, function (item) {
                return (item._id + '') === (data.reference + '');
            });

            if (referencedCrumble) {
                var starttime = new Date(data.date.getTime());
                starttime.setUTCHours(7, 0, 0, 0);
                var endtime = new Date(data.date.getTime());
                endtime.setUTCHours(15, 0, 0, 0);
                var copy = {
                    loc: referencedCrumble.loc,
                    starttime: starttime,
                    endtime: endtime,
                    counter: 1,
                    duration: 28800000,
                    object: referencedCrumble.object,
                    objectdetails: referencedCrumble.objectdetails,
                    activity: data.activity,
                    activityDetails: data.activityDetails,
                    entity: data.entity,
                    date: data.date
                };

                crumbleModel.save(copy, function (err) {
                    if (err) {
                        deferred.reject(err);
                    }
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }
        }
    });

    return deferred.promise;
};

exports.getTrackedTimeForActivity = function (data) {
    var deferred = Q.defer();

    crumbleModel.getTrackedTimeForActivity(data, function (err, result) {
        if (err || !result) {
            deferred.reject(err);
        } else {
            result = _.filter(result, function (item) {
                return !item.deleted;
            });
            deferred.resolve(result);
        }
    });

    return deferred.promise;
};

exports.getTrackedTimeAndActivity = function (data) {
    var deferred = Q.defer();

    crumbleModel.getTrackedTimeAndActivity(data, function (err, result) {
        if (err || !result) {
            deferred.reject(err);
        } else {
            result = _.filter(result, function (item) {
                return !item.deleted;
            });
            deferred.resolve(result);
        }
    });

    return deferred.promise;
};

exports.deleteTrackedTimeByCrumbleReference = function (data) {
    var deferred = Q.defer();

    crumbleModel.getCrumbleById(data.reference, function (err, crumble) {
        if (err) {
            deferred.reject(err);
        } else {
            var referencedCrumble = _.find(crumble.crumbles, function (item) {
                return (item._id + '') === (data.reference + '');
            });

            if (referencedCrumble) {
                crumbleModel.softDeleteCrumble({
                    entity: data.entity,
                    date: crumble.date,
                    activity: referencedCrumble.activity,
                    object: referencedCrumble.object
                }, function (err) {
                    if (err) {
                        deferred.reject(err);
                    }
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }
        }
    });

    return deferred.promise;
};