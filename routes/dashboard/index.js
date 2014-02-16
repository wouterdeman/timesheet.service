'use strict';

module.exports = function (app) {
	var models = require('../../models/');
	var Entry = models.entryModel;
	var User = models.userModel;
	var _ = require('lodash-node');

	app.get('/dashboard/last10', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		Entry.getLast10(function (err, entries) {
			if (err) {
				res.json(err);
				return;
			}
			var result = _.map(entries, function (entry) {
				return {
					loc: entry.loc,
					user: entry.user.name,
					time: entry.updated
				};
			});

			res.json(result);
		});
	});

	app.get('/dashboard/count', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		Entry.count(function (err, count) {
			if (err) {
				res.json(err);
				return;
			}

			res.json(count);
		});
	});

	app.get('/dashboard/lastuserlocation', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		User.find({}, function (err, users) {
			if (err) {
				res.json(err);
				return;
			}

			var userIds = _.pluck(users, '_id');

			Entry.getLastLocationForUsers(userIds,
				function (err, entries) {
					if (err) {
						res.json(err);
						return;
					}
					var result = _.map(entries, function (entry) {
						return {
							loc: entry.loc,
							user: entry.user.name,
							time: entry.updated
						};
					});

					res.json(result);
				});
		});
	});
};