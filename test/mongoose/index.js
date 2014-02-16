'use strict';

// Mongoose connect is called once by the app.js & connection established
// No need to include it elsewhere
var mongoose = require('mongoose');
mongoose.connect('mongodb://testable:bITe2014@troup.mongohq.com:10000/Testable');

var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {});

var async = require('async');
var _ = require('lodash-node');

exports.dropCollections = function (callback) {
	var collections = _.keys(connection.collections);
	async.forEach(collections, function (collectionName, done) {
		var collection = connection.collections[collectionName];
		collection.drop(function (err) {
			if (err && err.message !== 'ns not found') {
				done(err);
			}
			done(null);
		});
	}, callback);
};