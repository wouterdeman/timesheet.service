'use strict';

var models = require('../modules/timeandwork/models');
var userstoremodels = require('../modules/userstore/models');
var User = userstoremodels.userModel;
var Customer = models.customerModel;
var Q = require('q');
var TimeTracker = require('../modules/timetracker/service');
var AuthStore = require('../modules/authstore/service');
var _ = require('lodash-node');
var async = require('async');

exports.saveCrumble = function (token, loc, objectid, objectdetails) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            console.log('Save crumble no valid entity');
            deferred.reject();
            return;
        }

        User.findById(entity).then(function (user) {
            if (!user) {
                console.log('Save crumble no valid user ' + entity);
                deferred.reject();
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
        }, deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.registerGoogleAuth = function (refreshtoken) {
    var deferred = Q.defer();

    AuthStore.registerGoogleAuth(refreshtoken, function (email, done) {
        User.findOne({
            emails: email
        }).then(function (user) {
            if (user) {
                done(user._id);
            } else {
                deferred.reject();
            }
        }, deferred.reject);
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

        Customer.getById(data.customer).then(function (customer) {
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
        }, deferred.reject);


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

        Customer.getById(data.customer).then(function (customer) {
            TimeTracker.addActivityToZone({
                entity: entity,
                loc: data.loc,
                activity: customer._id,
                activityDetails: customer
            }).then(deferred.resolve).fail(deferred.reject);
        }, deferred.reject);
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

        Customer.getById(data.customer).then(function (customer) {
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
        }, deferred.reject);
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
        User.findById(entity).then(function (user) {
            if (!user) {
                deferred.reject();
                return;
            }
            Customer.save(customer).then(deferred.resolve, deferred.reject);
        }, deferred.reject);
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

    Customer.getAll().then(deferred.resolve, deferred.reject);
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
    User.findByEmail(data.email).then(function (user) {
        if (!user) {
            deferred.reject();
            return;
        }
        var entity = user.length ? user[0] : user;
        TimeTracker.getTrackedTimeForActivity({
            entity: entity._id,
            activity: data.customer,
            from: new Date(data.year, data.month, 1),
            to: new Date(data.year, data.month + 1, 1)
        }).then(function (trackedTimeForActivity) {
            deferred.resolve(trackedTimeForActivity);
        }).fail(deferred.reject);
    }, deferred.reject);
    //}).fail(deferred.reject);

    return deferred.promise;
};

exports.getTrackedTimeAndCustomer = function (data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(data.token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        TimeTracker.getTrackedTimeAndActivity({
            entity: entity,
            from: new Date(data.year, data.month, 1),
            to: new Date(data.year, data.month + 1, 1)
        }).then(function (trackedTimeAndActivity) {
            async.forEach(trackedTimeAndActivity, function (item, callback) {
                if (!item.activity) {
                    TimeTracker.getActiveActivity({
                        entity: entity,
                        loc: item.loc
                    }).done(function (suggestion) {
                        if (suggestion) {
                            item.suggestedCustomer = suggestion.activity;
                            item.suggestedCustomerDetails = suggestion.activityDetails;
                        }
                        callback();
                    });
                } else {
                    callback();
                }
            }, function () {
                var result = _.map(trackedTimeAndActivity, function (trackedTime) {
                    return {
                        date: trackedTime.date,
                        duration: trackedTime.duration,
                        device: trackedTime.object,
                        devicedetails: trackedTime.objectdetails,
                        customer: trackedTime.activity,
                        suggestedCustomer: trackedTime.suggestedCustomer,
                        suggestedCustomerDetails: trackedTime.suggestedCustomerDetails,
                        reference: trackedTime.reference
                    };
                });
                deferred.resolve(result);
            });
        }).fail(deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.updateCustomerForTrackedTime = function (data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(data.token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        Customer.getById(data.customer).then(function (customer) {
            TimeTracker.updateActivityForTrackedTime({
                entity: entity,
                date: new Date(Date.UTC(data.year, data.month, data.day)),
                activity: data.customer,
                activityDetails: customer,
                object: data.device
            }).then(deferred.resolve).fail(deferred.reject);
        }, deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.copyReferencedTrackedTime = function (data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(data.token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        Customer.getById(data.customer).then(function (customer) {
            TimeTracker.copyTrackedTimeByCrumbleReference({
                entity: entity,
                date: new Date(Date.UTC(data.year, data.month, data.day)),
                activity: data.customer,
                activityDetails: customer,
                reference: data.reference
            }).then(deferred.resolve).fail(deferred.reject);
        }, deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.deleteReferencedTrackedTime = function (data) {
    var deferred = Q.defer();
    AuthStore.verifyToken(data.token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }
        TimeTracker.deleteTrackedTimeByCrumbleReference({
            entity: entity,
            reference: data.reference
        }).then(deferred.resolve).fail(deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};