'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyEntityId2 = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
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

describe('Timetracker crumbles', function () {
	describe('when saving a crumble', function () {
		clearDB();
		it('should save without errors', function (done) {
			var data = {
				entity: dummyEntityId,
				loc: [51.226956, 4.401744]
			};

			timetracker.saveCrumble(data).then(done);
		});
		var todayscrumblesResult;
		it('and we retrieve todays crumbles', function (done) {
			timetracker.getTodaysCrumbles({
				entity: dummyEntityId
			}).then(function (todayscrumbles) {
				todayscrumblesResult = todayscrumbles;
				done();
			});
		});
		it('and we should have one crumble', function (done) {
			assert.equal(todayscrumblesResult.crumbles.length, 1);
			done();
		});
	});
	describe('when getting todays crumbles when there are none', function () {
		clearDB();
		var todayscrumblesResult;
		it('and we retrieve todays crumbles', function (done) {
			timetracker.getTodaysCrumbles({
				entity: dummyEntityId
			}).then(function (todayscrumbles) {
				todayscrumblesResult = todayscrumbles;
				done();
			});
		});
		it('then we should have no crumbles returned', function (done) {
			assert.equal(todayscrumblesResult, null);
			done();
		});
	});
	describe('when saving 2 crumbles', function () {
		clearDB();
		var data = {
			entity: dummyEntityId,
			loc: [51.226956, 4.401744]
		};
		it('should save without errors', function (done) {
			timetracker.saveCrumble(data).then(done);
		});
		it('should again save without errors', function (done) {
			timetracker.saveCrumble(data).then(done);
		});
		var todayscrumblesResult;
		it('and we retrieve todays crumbles', function (done) {
			timetracker.getTodaysCrumbles({
				entity: dummyEntityId
			}).then(function (todayscrumbles) {
				todayscrumblesResult = todayscrumbles;
				done();
			});
		});
		it('and we should have 2 crumbles', function (done) {
			assert.equal(todayscrumblesResult.crumbles.length, 2);
			done();
		});
	});
	describe('when saving an incomplete crumble', function () {
		clearDB();
		var data = {
			entity: dummyEntityId,
		};
		it('should not save without errors', function (done) {
			timetracker.saveCrumble(data).fail(function (err) {
				assert.ok(err, 'Saving a crumble failed');
				done();
			});
		});
	});
	describe('when getting todays crumbles for no given entity', function () {
		clearDB();
		it('should fail and return errors', function (done) {
			timetracker.getTodaysCrumbles().fail(function (err) {
				assert.ok(err, 'Saving a crumble failed');
				done();
			});
		});
	});
	describe('when saving 20 crumbles and getting the last 10 saved crumbles', function () {
		clearDB();
		it('should save 20 crumbles without errors', function (done) {
			var data = [];

			for (var i = 0; i < 20; i++) {
				data.push({
					entity: dummyEntityId,
					details: {
						name: 'Joske Vermeulen'
					},
					loc: [51.226956, 4.401744]
				});
			}

			async.each(data, function (crumble, iterateCallback) {
				timetracker.saveCrumble(crumble).then(iterateCallback);
			}, function (err) {
				if (!err) {
					done();
				}
			});
		});
		it('should return 20 crumbles when we ask for todays crumbles', function (done) {
			timetracker.getTodaysCrumbles({
				entity: dummyEntityId
			}).then(function (todayscrumbles) {
				assert.equal(todayscrumbles.crumbles.length, 20);
				done();
			});
		});
		it('should return the last 10 crumbles when we ask for the last 10 crumbles', function (done) {
			timetracker.getLast10Crumbles().then(function (last10crumbles) {
				assert.equal(last10crumbles.length, 10);
				assert.equal(last10crumbles[0].details.name, 'Joske Vermeulen');
				done();
			});
		});
	});
	describe('when saving a crumble with details', function () {
		clearDB();
		it('should save without errors', function (done) {
			var data = {
				entity: dummyEntityId,
				details: {
					type: 'BMW 316D',
					platenumber: '1-AHQ-481',
					area: 'Geel'
				},
				loc: [51.226956, 4.401744]
			};

			timetracker.saveCrumble(data).then(done);
		});
		var todayscrumbleResult;
		it('and we retrieve todays crumbles', function (done) {
			timetracker.getTodaysCrumbles({
				entity: dummyEntityId
			}).then(function (todayscrumble) {
				todayscrumbleResult = todayscrumble;
				done();
			});
		});
		it('and we should have one crumble', function (done) {
			assert.equal(todayscrumbleResult.crumbles.length, 1);
			done();
		});
		it('and we should have still have our entity details', function (done) {
			assert.equal(todayscrumbleResult.details.type, 'BMW 316D');
			assert.equal(todayscrumbleResult.details.platenumber, '1-AHQ-481');
			assert.equal(todayscrumbleResult.details.area, 'Geel');
			done();
		});
	});
	describe('when retrieving the last location for all entities', function () {
		clearDB();
		it('should save 2 crumbles without errors', function (done) {
			var data = [];

			data.push({
				entity: dummyEntityId,
				details: {
					name: 'Joske Vermeulen'
				},
				loc: [51.226956, 4.401744]
			});


			data.push({
				entity: dummyEntityId,
				details: {
					name: 'Joske Vermeulen'
				},
				loc: [55.226956, 4.401744]
			});

			data.push({
				entity: dummyEntityId2,
				details: {
					name: 'Jefke Vermeulen'
				},
				loc: [60.226956, 4.401744]
			});

			async.each(data, function (crumble, iterateCallback) {
				timetracker.saveCrumble(crumble).then(iterateCallback);
			}, function (err) {
				if (!err) {
					done();
				}
			});
		});
		it('should return the last location for each entity', function (done) {
			timetracker.getLastLocations().then(function (lastlocations) {
				assert.equal(lastlocations[0].details.name, 'Joske Vermeulen');
				assert.equal(lastlocations[0].loc[0], 55.226956);
				done();
			});
		});
	});
});