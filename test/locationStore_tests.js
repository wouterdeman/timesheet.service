'use strict';

var locationStore = require('../modules/locationStore/service');
var mongoose = require('mongoose');
var db = require('./mongoose');
var async = require('async');

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;

var clearDB = function () {
    before(function (done) {
        db.dropCollections(function () {
            done();
        });
    });
};

describe('LocationStore', function () {
    describe('when saving a location', function () {
        clearDB();
        it('should save without errors', function (done) {
            var data = {
                markers: [{longtitude: 51.226956, latitude:4.401744}]
            };

            locationStore.saveLocation(data).then(done);
        });
    });
});
