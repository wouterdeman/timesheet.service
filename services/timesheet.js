'use strict';

var models = require('../models');
var User = models.userModel;
var Customer = models.customerModel;
var Q = require('q');
var TimeTracker = require('../modules/timetracker/service');
var AuthStore = require('../modules/authstore/service');
var _ = require('lodash-node');

exports.saveCrumble = function (token, loc, objectid, objectdetails) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }
        User.findById(entity, function (err, user) {
            if (err && !user) {
                deferred.reject(err);
                return;
            }

            var data = {
                entity: entity,
                details: {
                    emails: user.emails,
                    firstname: user.firstname,
                    lastname: user.lastname
                },
                loc: loc,
                object: objectid,
                objectdetails: objectdetails
            };

            TimeTracker.saveCrumble(data).then(deferred.resolve).fail(deferred.reject);
        });
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.registerGoogleAuth = function (refreshtoken) {
    var deferred = Q.defer();

    AuthStore.registerGoogleAuth(refreshtoken, function (email, done) {
        User.findOne({
            emails: email
        }, function (err, user) {
            if (!err && user) {
                done(user._id);
            } else {
                deferred.reject(err);
            }
        });
    }).then(function (token) {
        deferred.resolve(token);
    });

    return deferred.promise;
};

exports.getLast10Entries = function () {
    var deferred = Q.defer();

    TimeTracker.getLast10Crumbles().then(function (results) {
        var result = _.map(results, function (crumble) {
            return {
                loc: crumble.loc,
                user: crumble.details.firstname + ' ' + crumble.details.lastname,
                time: crumble.endtime
            };
        });
        deferred.resolve(result);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.getTotalCountOfEntries = function () {
    var deferred = Q.defer();

    TimeTracker.getTotalCountOfCrumbles().then(function (count) {
        deferred.resolve(count);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.getTotalAmountOfTrackedMinutes = function () {
    var deferred = Q.defer();

    TimeTracker.getTotalTrackedTime().then(function (duration) {
        deferred.resolve(duration / 1000 / 60);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.getLastLocations = function () {
    var deferred = Q.defer();

    TimeTracker.getLastLocations().then(function (results) {
        var result = _.map(results, function (crumble) {
            return {
                loc: crumble.loc,
                user: crumble.details.firstname + ' ' + crumble.details.lastname,
                time: crumble.endtime
            };
        });
        deferred.resolve(result);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.getZone = function (token, loc) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        TimeTracker.getZoneAndActivities({
            entity: entity,
            loc: loc
        }).then(function (zone) {
            deferred.resolve(zone);
        }).fail(deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.registerNewZone = function (token, data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        Customer.getById(data.customer, function (err, customer) {
            if (err) {
                deferred.reject(err);
            }

            TimeTracker.saveZone({
                entity: entity,
                loc: data.loc,
                zoneDetails: {
                    name: data.name,
                    description: data.description
                },
                activity: customer._id,
                activityDetails: customer
            }).then(deferred.resolve).fail(deferred.reject);
        });


    }).fail(deferred.reject);
    return deferred.promise;
};

exports.changeCustomer = function (token, data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        Customer.getById(data.customer, function (err, customer) {
            if (err) {
                deferred.reject(err);
            }

            TimeTracker.addActivityToZone({
                entity: entity,
                loc: data.loc,
                activity: customer._id,
                activityDetails: customer
            }).then(deferred.resolve).fail(deferred.reject);
        });


    }).fail(deferred.reject);
    return deferred.promise;
};

exports.updateZone = function (token, data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        Customer.getById(data.customer, function (err, customer) {
            if (err) {
                deferred.reject(err);
            }

            TimeTracker.updateZone({
                entity: entity,
                loc: data.loc,
                zone: data.zone,
                zoneDetails: {
                    name: data.name,
                    description: data.description
                },
                activity: customer._id,
                activityDetails: customer
            }).then(deferred.resolve).fail(deferred.reject);
        });
    }).fail(deferred.reject);
    return deferred.promise;
};

exports.saveCustomer = function (token, customer) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }
        User.findById(entity, function (err, user) {
            if (err && !user) {
                deferred.reject(err);
                return;
            }

            Customer.save(customer, function (err) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve();
            });
        });
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.getCustomers = function () {
    var deferred = Q.defer();
    /*AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }
        User.findById(entity, function (err, user) {
            if (err && !user) {
                deferred.reject(err);
                return;
            }*/

    Customer.getAll(function (err, customers) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(customers);
    });
    //});
    //}).fail(deferred.reject);

    return deferred.promise;
};

exports.getMapsShowCase = function () {
    var deferred = Q.defer();

    TimeTracker.getMapsShowCase().then(function (showCaseData) {
        deferred.resolve(showCaseData);
    }).fail(deferred.reject);
    return deferred.promise;
};

exports.getTrackedTimeForCustomer = function (data) {
    var deferred = Q.defer();
    /*AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }*/
    User.findByEmail(data.email, function (err, user) {
        if (err && !user) {
            deferred.reject(err);
            return;
        }

        TimeTracker.getTrackedTimeForActivity({
            entity: user._id,
            activity: data.customer,
            from: new Date(data.year, data.month - 1, 1),
            to: new Date(data.year, data.month, 0)
        }).then(function (trackedTimeForActivity) {
            deferred.resolve(trackedTimeForActivity);
        }).fail(deferred.reject);
    });
    //}).fail(deferred.reject);

    return deferred.promise;
};