'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/entry', function (req, res) {
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var loc = req.body.loc;

		TimesheetService.saveCrumble(token, loc).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});
};