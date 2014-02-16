'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new Schema({
	token: {
		type: String
	},
	createDate: {
		type: Date,
		default: Date.now
	}
});

var Token = mongoose.model('Token', TokenSchema);

var save = function (token) {
	token.save();
};

var create = function (token) {
	var newToken = new Token({
		token: token
	});
	return newToken;
};

exports.tokenSchema = TokenSchema;
exports.save = save;
exports.create = create;