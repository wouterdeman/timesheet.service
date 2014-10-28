'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');

exports.getLast20 = function (object) {
    var deferred = Q.defer();

    crumbleModel.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $sort: {
                'crumbles.endtime': -1
            }
        }, {
            $limit: 20
        }, {
            $match: {
                'crumbles.object': object
            }
        }, {
            $project: {
                entity: 1,
                details: 1,
                starttime: '$crumbles.starttime',
                endtime: '$crumbles.endtime',
                duration: '$crumbles.duration',
                loc: '$crumbles.loc',
                crumbleId: '$crumbles._id',
                zone: '$crumbles.zone',
                zonedetails: '$crumbles.zoneDetails',
                activity: '$crumbles.activity',
                activitydetails: '$crumbles.activityDetails'
            }
        }]).then(deferred.resolve, deferred.reject);

    return deferred.promise;
};

exports.getActivityLast12Hours = function (object) {
    var deferred = Q.defer();

    crumbleModel.aggregate([{
        $unwind: '$crumbles'
    }, {
        $sort: {
            'crumbles.endtime': 1
        }
    }, {
        $match: {
            'crumbles.object': object
        }
    }, {
        $group: {
            _id: {
                hour: {
                    $hour: '$crumbles.endtime'
                },
                month: {
                    $month: '$crumbles.endtime'
                },
                day: {
                    $dayOfMonth: '$crumbles.endtime'
                },
                year: {
                    $year: '$crumbles.endtime'
                }
            },
            count: {
                $sum: '$crumbles.counter'
            },
            object: {
                $first: '$crumbles.object'
            }
        }
    }, {
        $limit: 12
    }]).then(deferred.resolve, deferred.reject);

    return deferred.promise;
};
