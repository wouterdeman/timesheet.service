'use strict';

var async = require('async');
var mocha = require('mocha');
var it = mocha.it;
var describe = mocha.describe;

var mongoose = require('mongoose');
mongoose.connect('mongodb://timesheetService:bITe2014@dharma.mongohq.com:10009/TimesheetService');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('connection open');
});

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

// FROM
var crumbleSchema = new Schema({
	entity: ObjectId,
	details: Schema.Types.Mixed,
	date: {
		type: Date
	},
	crumbles: [{
		loc: {
			type: [Number],
			index: '2d'
		},
		time: {
			type: Date
		}
	}]
});
var Crumble = mongoose.model('crumble', crumbleSchema);

// TO
var UserSchema = new Schema({
	firstname: String,
	lastname: String,
	emails: [String],
	updated: {
		type: Date,
		default: Date.now
	}
});

var User = mongoose.model('User', UserSchema);

var updateCrumble = function (crumbleData, callback) {
	Crumble.update({
		entity: crumbleData.entity
	}, {
		$set: {
			details: crumbleData.details
		}
	}, {
		multi: true
	}, function (err) {
		callback(err);
	});
};

var run = function (callback) {
	User.find({}, function (err, users) {
		async.each(users, function (user, iterateCallback) {
			var crumbleData = {
				entity: user._id,
				details: {
					emails: user.emails,
					firstname: user.firstname,
					lastname: user.lastname
				}
			};

			updateCrumble(crumbleData, iterateCallback);
		}, function (err) {
			if (!err) {
				callback();
			}
		});
	});
};

describe('Timetracker crumble user details migration', function () {
	this.timeout(3600000);
	describe('when migration a crumble', function () {
		it('should run without errors', function (done) {
			run(done);
		});
	});
});