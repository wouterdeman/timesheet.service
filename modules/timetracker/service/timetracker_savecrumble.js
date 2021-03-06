'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var rawCrumbleModel = models.rawCrumbleModel;
var objectTrackingModel = models.objectTrackingModel;
var zoneModel = models.zoneModel;
var Q = require('q');
require('date-utils');
var validators = require('./validators');
var crumbleValidator = validators.crumbleValidator;
var gju = require('geojson-utils');
var _ = require('lodash-node');

var calculcateDistance = function (first, second) {
    return gju.pointDistance({
        type: 'Point',
        coordinates: first
    }, {
        type: 'Point',
        coordinates: second
    });
};

var setZoneDetailsAndActiveActivity = function (lastCrumbleInRange, zone) {
    lastCrumbleInRange.zone = zone._id;
    lastCrumbleInRange.zoneDetails = zone.zoneDetails;
    var activeActivity = _.find(zone.activities, {
        'active': true
    });
    lastCrumbleInRange.activity = activeActivity.activity;
    lastCrumbleInRange.activityDetails = activeActivity.activityDetails;
    return lastCrumbleInRange;
};

var checkIfWeHaveCrumblesInRangeAndUpdate = function (deferred, crumble, lastCrumbles, timeCopy, objectTracking, zone) {
    if (lastCrumbles && lastCrumbles.length) {
        var latestCrumble = lastCrumbles[0];
        // We should set the end time when leaving a zone, so if the the latest crumble came from a zone
        if (latestCrumble.zone && calculcateDistance(latestCrumble.loc, crumble.loc) < 500) {
            latestCrumble.endtime = timeCopy;
            latestCrumble.duration = latestCrumble.endtime.getTime() - latestCrumble.starttime.getTime();
            crumbleModel.updateEndtime(latestCrumble);
        }

        var lastCrumbleInRange = _.find(lastCrumbles, function (lastCrumble) {
            var distance = calculcateDistance(lastCrumble.loc, crumble.loc);
            return distance < 30;
        });

        if (lastCrumbleInRange) {
            lastCrumbleInRange.endtime = timeCopy;
            lastCrumbleInRange.duration = lastCrumbleInRange.endtime.getTime() - lastCrumbleInRange.starttime.getTime();
            lastCrumbleInRange.object = objectTracking.object;
            lastCrumbleInRange.objectdetails = objectTracking.details;

            //TODO: check if we are updating for the same zone/activity/object

            if (zone) {
                lastCrumbleInRange = setZoneDetailsAndActiveActivity(lastCrumbleInRange, zone);
            }
            crumbleModel.updateEndtime(lastCrumbleInRange).then(deferred.resolve, deferred.reject);
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
        crumble.activity = activeActivity.activity;
        crumble.activityDetails = activeActivity.activityDetails;
    }

    crumbleModel.save(crumble).then(deferred.resolve, deferred.reject);
};

exports.saveCrumble = function (data) {
    var deferred = Q.defer();

    if (crumbleValidator.validateIncomingCrumble(data, deferred)) {
        return deferred.promise;
    }

    var crumble = crumbleModel.create(data);
    var objectTracking = objectTrackingModel.create(data);
    var rawCrumble = rawCrumbleModel.create(data);
    rawCrumbleModel.save(rawCrumble);

    crumbleModel.lastCrumbles(data.entity, objectTracking.object, function (lastCrumbles) {
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
                objectTrackingModel.save(objectTracking).then(deferred.resolve, deferred.reject);
            }).fail(deferred.reject);
        });
    }, deferred.reject);

    return deferred.promise;
};