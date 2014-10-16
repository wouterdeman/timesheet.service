'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/auth/token', function (req, res) {
		if (!req.body.hasOwnProperty('refreshtoken') || !req.body.hasOwnProperty('provider')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		var refreshtoken = req.body.refreshtoken;
		var provider = req.body.provider;

		res.setHeader('Access-Control-Allow-Origin', '*');

		// Validate incoming data
		if (!(refreshtoken && provider && provider === 'google')) {
			res.json(false);
		}

		TimesheetService.registerGoogleAuth(refreshtoken).then(function (token) {
			res.json(token);
		}).fail(function () {
			res.json(false);
		});
	});
};