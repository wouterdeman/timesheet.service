'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var db = require('./mongoose');

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;

var clearDB = function () {
	before(function (done) {
		db.removeAllFromCollections(function () {
			done();
		});
	});
};

describe('Timetracker crumbles', function () {
	this.timeout(3600);
	describe('when saving a crumble', function () {
		clearDB();
		it('should save without errors', function (done) {
			var data = {
				entity: dummyEntityId,
				loc: [51.226956, 4.401744]
			};

			timetracker.saveCrumble(data).then(function () {
				done();
			});
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
		it('and the counter should be set', function (done) {
			assert.equal(todayscrumblesResult.crumbles[0].counter, 1);
			done();
		});
		it('and the duration should be set to 5 minutes', function (done) {
			assert.equal(todayscrumblesResult.crumbles[0].duration, 300000);
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
			timetracker.saveCrumble(data).then(function () {
				done();
			});
		});
		it('should again save without errors', function (done) {
			timetracker.saveCrumble(data).then(function () {
				done();
			});
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
		it('and we should have 1 crumbles because they come from the same location', function (done) {
			assert.equal(todayscrumblesResult.crumbles.length, 1);
			done();
		});
		it('and the counter should be set to two', function (done) {
			assert.equal(todayscrumblesResult.crumbles[0].counter, 2);
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
});