'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var token = require('./token');

var UserSchema = new Schema({
	name: String,
	email: String,
	provider: String,
	facebook: {},
	twitter: {},
	github: {},
	google: {},
	token: [token.tokenSchema],
	updated: {
		type: Date,
		default: Date.now
	}
});

/**
 * Validations
 */
// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function (name) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) {
		return true;
	}
	return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
	// if you are authenticating by any of the oauth strategies, don't validate
	if (authTypes.indexOf(this.provider) !== -1) {
		return true;
	}
	return email.length;
}, 'Email cannot be blank');

var User = mongoose.model('User', UserSchema);

var findOne = function (conditions, callback) {
	//Model.findOne(conditions, [fields], [options], [callback])
	User.findOne(conditions, callback);
};

var find = function (conditions, callback) {
	User.find(conditions, callback);
};

exports.findOne = findOne;
exports.find = find;