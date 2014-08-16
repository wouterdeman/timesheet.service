'use strict';

var models = require('../models');
var AbsenceModel = models.absenceModel;
var Q = require('q');

exports.save = function (absence, absencerights) {
    var deferred = Q.defer();

    // todo: check saldo & use absence right using the correct absence right settings
    if (!absence.absenceright && !absencerights.length) {
        deferred.reject('No available absence rights found');
        return deferred.promise;
    }

    if (!absence.absenceright) {
        absence.absenceright = absencerights[0]._id;
    }
    AbsenceModel.save(absence).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.list = function (conditions) {
    var deferred = Q.defer();
    AbsenceModel.find(conditions).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.update = function (id, absence) {
    var deferred = Q.defer();
    AbsenceModel.update(id, absence).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.remove = function (id) {
    var deferred = Q.defer();
    AbsenceModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.get = function (id) {
    var deferred = Q.defer();
    AbsenceModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};