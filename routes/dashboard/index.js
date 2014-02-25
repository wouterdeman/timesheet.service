'use strict';

module.exports = function (app) {
	var models = require('../../models/');
	var Entry = models.entryModel;
	var User = models.userModel;
	var _ = require('lodash-node');
	var services = require('../../services');
	var timesheetService = services.timesheetService;

	app.get('/dashboard/last10', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		timesheetService.getLast10Entries().then(function (results) {
			res.json(results);
		}).fail(function (err) {
			console.log(err);
			res.json(false);
		});
	});

	app.get('/dashboard/count', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		timesheetService.getTotalCountOfEntries().then(function (count) {
			res.json(count);
		}).fail(function (err) {
			console.log(err);
			res.json(false);
		});
	});

	app.get('/dashboard/trackedminutes', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		timesheetService.getTotalAmountOfTrackedMinutes().then(function (amount) {
			res.json(amount);
		}).fail(function (err) {
			console.log(err);
			res.json(false);
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