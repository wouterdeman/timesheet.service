'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
require('date-utils');
var Q = require('q');

exports.getMapsShowCase = function () {
    var deferred = Q.defer();

    var nowMinus1Month = new Date().add({
        months: -1
    });

    crumbleModel.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $sort: {
                'crumbles.starttime': 1
            }
        }, {
            $match: {
                'crumbles.starttime': {
                    $gte: nowMinus1Month
                }
            }
        }, {
            $project: {
                _id: 0,
                starttime: '$crumbles.starttime',
                endtime: '$crumbles.endtime',
                loc: '$crumbles.loc',
                details: 1,
                duration: '$crumbles.duration',
                counter: '$crumbles.counter'
            }
        }]).then(deferred.resolve, deferred.reject);

    return deferred.promise;
};