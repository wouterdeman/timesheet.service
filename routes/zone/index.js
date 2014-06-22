'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/zones/current', function (req, res) {		
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;			
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var loc = req.body.loc;

		TimesheetService.getZone(token, loc).then(function (zone) {			
			res.json(zone || 0);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/zones/register', function (req, res) {
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var data = {
			loc: req.body.loc,
			name: req.body.name,
			description: req.body.description,
			customer: req.body.customer
		};

		TimesheetService.registerNewZone(token, data).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/zones/update', function (req, res) {
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var data = {
			loc: req.body.loc,
			name: req.body.name,
			description: req.body.description,
			customer: req.body.customer,
			zone: req.body.zone
		};

		TimesheetService.updateZone(token, data).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});

	app.post('/zones/changecustomer', function (req, res) {
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var data = {
			loc: req.body.loc,
			customer: req.body.customer
		};

		TimesheetService.changeCustomer(token, data).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});
};