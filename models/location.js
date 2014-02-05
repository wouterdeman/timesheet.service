// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var User = require('./user');
var async = require('async');

var locationSchema = new Schema({
	type: String,
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

var Location = mongoose.model('location', locationSchema);

var save = function(location) {	
	var newLocation = new Location(location);
	newLocation.save();
};

exports.save = save;