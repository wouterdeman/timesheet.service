'use strict';

module.exports = function (app) {
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

		timesheetService.getLastLocations().then(function (entries) {
			res.json(entries);
		}).fail(function (err) {
			console.log(err);
			res.json(false);
		});
	});
};