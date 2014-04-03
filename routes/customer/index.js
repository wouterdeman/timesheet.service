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
};