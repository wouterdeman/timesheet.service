'use strict';

var models = require('../models');
var User = models.userModel;
var Q = require('q');
var TimeTracker = require('../modules/timetracker/service');
var AuthStore = require('../modules/authstore/service');
var _ = require('lodash-node');

exports.saveCrumble = function (token, loc) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        var data = {
            entity: entity,
            loc: loc
        };

        TimeTracker.saveCrumble(data).then(deferred.resolve).fail(deferred.reject);
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
        var entitiesInResults = _.uniq(_.pluck(results, 'entity'), function (entity) {
            return '' + entity;
        });
        User.find({
            _id: {
                $in: entitiesInResults
            }
        }, function (err, users) {
            console.log(entitiesInResults + ' -> ' + users);
            if (err) {
                deferred.reject(err);
            } else {
                var result = _.map(results, function (crumble) {
                    var user = _.find(users, {
                        '_id': crumble.entity
                    });
                    return {
                        loc: crumble.crumbles.loc,
                        user: user ? user.name : 'unrecognised user',
                        time: crumble.crumbles.time
                    };
                });
                deferred.resolve(result);
            }
        });
    }).fail(deferred.reject);

    return deferred.promise;
};