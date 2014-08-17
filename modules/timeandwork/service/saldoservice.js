'use strict';

var models = require('../models');
var AbsenceModel = models.absenceModel;
var AbsenceRightModel = models.absenceRightModel;
var Q = require('q');
var _ = require('lodash-node');

exports.list = function (conditions) {
    var deferred = Q.defer();

    AbsenceModel.find(conditions).then(function (absences) {
        AbsenceRightModel.find(conditions).then(function (absencerights) {
            absencerights = _.map(absencerights, function (absenceright) {
                absenceright.used = _.reduce(absences, function (sum, item) {
                    return sum + (item.absenceright === absenceright._id ? item.amount : 0);
                }, 0);
                console.log('absenceright used: ' + absenceright.used);
                absenceright.joske = 'bla';
                console.log(absenceright);
                return absenceright;
            });
            console.log('absence rights: ' + absencerights);
            deferred.resolve(absencerights);
        }, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
};