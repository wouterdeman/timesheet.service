'use strict';

var models = require('../models');
var AbsenceModel = models.absenceModel;
var AbsenceRightModel = models.absenceRightModel;
var Q = require('q');
var _ = require('lodash-node');

exports.list = function(conditions) {
    var deferred = Q.defer();

    AbsenceModel.find(conditions).then(function(absences) {
        absences = _.sortBy(absences, function(absence) {
            return absence.date.getTime();
        });

        AbsenceRightModel.find(conditions).then(function(absencerights) {
            _.forEach(absencerights, function(absenceright) {
                absenceright.used = _.reduce(absences, function(sum, item) {
                    var absencerightMatch = item.absenceright + '' === absenceright._id + '';                    
                    return sum + (absencerightMatch ? item.amount : 0);
                }, 0);
            });
            deferred.resolve(absencerights);
        }, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
};