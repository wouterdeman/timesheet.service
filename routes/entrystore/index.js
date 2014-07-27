'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/entry', function (req, res) {
		console.log('We have a winner:');
		console.log('token: ' + req.body.token);
		console.log('loc: ' + req.body.loc);
		console.log('objectid: ' + req.body.objectid);
		console.log('objectdetails: ' + req.body.objectdetails);
		console.log('location?: ' + req.body.location);
		if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('loc')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		var loc = req.body.loc;
		var objectid = req.body.objectid;
		var objectdetails = req.body.objectdetails;

		TimesheetService.saveCrumble(token, loc, objectid, objectdetails).then(function () {
			res.json(true);
		}).fail(function () {
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});
};