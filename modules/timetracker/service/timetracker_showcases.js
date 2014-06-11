'use strict';

var models = require('../models');
var crumbleModel = models.crumbleModel;
var Q = require('q');
require('date-utils');

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