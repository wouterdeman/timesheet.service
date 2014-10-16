'use strict';

var models = require('../models');
var AbsenceModel = models.absenceModel;
var FreezeModel = models.freezeModel;
var SaldoService = require('./saldoservice');
var holidayservice = require('./holidayservice');
var Q = require('q');
var _ = require('lodash-node');
var async = require('async');

var list = function (conditions) {
    var deferred = Q.defer();
    AbsenceModel.find(conditions).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

var freeze = function (date) {
    var deferred = Q.defer();
    FreezeModel.save(date).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

var getFrozen = function () {
    var deferred = Q.defer();
    FreezeModel.findOne().then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

var remove = function (id) {
    var deferred = Q.defer();
    AbsenceModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

var get = function (id) {
    var deferred = Q.defer();
    AbsenceModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

var createAbsencesForRange = function (absence, holidays, existingAbsences) {
    // We ignore absence requests on holidays
    var isHoliday = function (d) {
        return _.find(holidays, function (holiday) {
            var holidayDate = holiday.date;
            return holidayDate.getFullYear() === d.getFullYear() && holidayDate.getMonth() === d.getMonth() && holidayDate.getDate() === d.getDate();
        });
    };

    // We ignore existing absences
    var isExistingAbsence = function (d) {
        return _.find(existingAbsences, function (existingAbsence) {
            var existingAbsenceDate = existingAbsence.date;
            return existingAbsenceDate.getFullYear() === d.getFullYear() && existingAbsenceDate.getMonth() === d.getMonth() && existingAbsenceDate.getDate() === d.getDate();
        });
    };

    var data = [];
    for (var d = absence.from; d <= absence.to; d.setDate(d.getDate() + 1)) {
        var dayOfWeek = d.getDay();

        // We ignore weekend days by default
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(d) && !isExistingAbsence(d)) {
            var absenceToSave = {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
                amount: absence.amount,
                prenoon: absence.prenoon,
                year: d.getFullYear(),
                absenceright: absence.absenceright
            };
            data.push(absenceToSave);
        }
    }
    return data;
};

var save = function (absence) {
    var deferred = Q.defer();

    getFrozen().then(function (frozen) {
        if (absence.to.isBefore(absence.from)) {
            deferred.reject('The from date should fall before the to date!');
            return deferred.promise;
        }

        if (frozen && (absence.from.isBefore(frozen.date) || absence.from.equals(frozen.date))) {
            deferred.reject('Absences before ' + frozen.date.toFormat('DD/MM/YYYY') + ' are now allowed. Contact your administrator for more information!');
            return deferred.promise;
        }

        list({
            date: {
                '$gte': absence.from,
                '$lte': absence.to
            }
        }).then(function (absences) {
            holidayservice.list({
                date: {
                    '$gte': absence.from,
                    '$lte': absence.to
                }
            }).then(function (holidays) {
                var data = createAbsencesForRange(absence, holidays, absences);

                if (!data.length) {
                    deferred.reject('The absences you try to register do not fall on working days');
                    return deferred.promise;
                }

                SaldoService.list({
                    entity: absence.entity,
                    year: absence.from.getFullYear()
                }).then(function (absencerights) {
                    var allValid = true;

                    absencerights = _.sortBy(absencerights, function (right) {
                        return right.seqnr;
                    });

                    // Validate absence rights
                    _.forEach(data, function (item) {
                        if (!item.absenceright && !(absencerights && absencerights.length)) {
                            deferred.reject('No available absence rights found');
                            return deferred.promise;
                        }
                        if (!item.absenceright) {
                            var rightFound = false;
                            _.forEach(absencerights, function (right) {
                                // Monthly absence rights check
                                var monthlyUsageAvailable = !right.monthly || (right.monthly && right.used < item.date.getMonth() + 1);
                                // Enough right amount check
                                if (right.amount - right.used >= 1 && !item.absenceright && monthlyUsageAvailable) {
                                    item.absenceright = right._id;
                                    right.used++;
                                    rightFound = true;
                                }
                            });
                            if (!rightFound) {
                                allValid = false;
                                deferred.reject('No saldo left');
                                return deferred.promise;
                            }
                        }

                        item.entity = absence.entity;
                    });

                    if (!allValid) {
                        deferred.reject();
                        return deferred.promise;
                    }

                    async.each(data, function (item, iterateCallback) {
                        AbsenceModel.save(item).then(function () {
                            iterateCallback();
                        }, deferred.reject);
                    }, function (err) {
                        if (!err) {
                            deferred.resolve();
                        } else {
                            deferred.reject(err);
                        }
                    });
                });
            });
        });
    });
    return deferred.promise;
};

exports.freeze = freeze;
exports.getFrozen = getFrozen;
exports.list = list;
exports.remove = remove;
exports.get = get;
exports.save = save;
