'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	emails: [String],
	updated: {
		type: Date,
		default: Date.now
	}
});

var User = mongoose.model('User', UserSchema);

exports.findOne = function (conditions, callback) {
	//Model.findOne(conditions, [fields], [options], [callback])
	User.findOne(conditions, callback);
};

exports.find = function (conditions, callback) {
	User.find(conditions, callback);
};