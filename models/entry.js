// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var User = require('./user');
var async = require('async');

var userinfoSchema = new Schema({
	deviceid: String,
	devicetype: String
});

var entrySchema = new Schema({
	type: String,
	userinfo: [userinfoSchema],
	user: {
		type: ObjectId,
		ref: 'User'
	},
	//https://github.com/LearnBoost/mongoose/blob/master/examples/geospatial/person.js
	loc: {
		type: [Number],
		index: '2d'
	},
	updated: {
		type: Date,
		default: Date.now
	}
});

var UserInfo = mongoose.model('userinfo', userinfoSchema);
var Entry = mongoose.model('entry', entrySchema);

/**
 * Saves an entry
 * @param  {Entry} entry
 * @return {void}
 */
var save = function(entry) {
	var newUserInfo = new UserInfo(entry.userinfo);
	var newEntry = new Entry(entry);
	newEntry.userinfo = newUserInfo;

	newEntry.save();
};

var getLast10 = function(callback) {
	Entry.find().limit(10).sort({
		updated: 'desc'
	}).populate('user').exec(function(err, entries) {
		callback(err, entries);
	});
};

var count = function(callback) {
	Entry.count().exec(function(err, count) {
		callback(err, count);
	});
};

var getUniqueLocations = function(callback) {
	Entry.find({
		loc: Math.round(value * 100) / 100
	}).aggregate({
		$group: {
			_id: "$loc",
			entriesPerLocation: {
				$sum: 1
			}
		}
	}).sort({
		entriesPerLocation: 'desc'
	}).limit(100).exec(function(err, entries) {
		callback(err, entries);
	});
};

var getLastLocationForUsers = function(userIds, callback) {
	var result = [];
	async.forEach(userIds, function(userId, iterateCallback) {
		Entry.find({
			user: userId
		}).sort({
			updated: 'desc'
		}).limit(1).populate('user').exec(function(err, entries) {
			if (entries && entries.length > 0) {
				result.push(entries[0]);
			}
			iterateCallback();
		});
	}, function(err) {
		callback(err, result);
	});
};

exports.save = save;
exports.getLast10 = getLast10;
exports.getUniqueLocations = getUniqueLocations;
exports.entryModel = Entry;
exports.count = count;
exports.getLastLocationForUsers = getLastLocationForUsers;