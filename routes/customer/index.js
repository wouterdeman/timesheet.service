'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/customers/all', function (req, res) {
		if (!req.body.hasOwnProperty('token')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;

		TimesheetService.getCustomers(token).then(function (customers) {
			res.json(customers);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.get('/customers/all', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		TimesheetService.getCustomers().then(function (customers) {
			res.json(customers);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/customers/trackedTime', function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		TimesheetService.getTrackedTimeForCustomer({
			email: req.body.email,
			month: req.body.month,
			year: req.body.year,
			customer: req.body.customer
		}).then(function (trackedTime) {
			res.json(trackedTime);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/customers/trackedTimeAndCustomer', function (req, res) {
		if (!req.body.hasOwnProperty('token')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		TimesheetService.getTrackedTimeAndCustomer({
			token: req.body.token,
			month: req.body.month,
			year: req.body.year
		}).then(function (trackedTime) {
			res.json(trackedTime);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/customers/updateCustomerForTrackedTime', function (req, res) {
		if (!req.body.hasOwnProperty('token')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		TimesheetService.updateCustomerForTrackedTime({
			token: req.body.token,
			day: req.body.day,
			month: req.body.month,
			year: req.body.year,
			device: req.body.device,
			customer: req.body.customer
		}).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});
};