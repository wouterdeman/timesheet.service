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