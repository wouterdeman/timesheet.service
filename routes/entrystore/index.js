'use strict';

module.exports = function (app) {
	var services = require('../../services');
	var TimesheetService = services.timesheetService;

	app.post('/entry', function (req, res) {
		console.log('POST -> SAVE CRUMBLE: ');
		console.log('token: ' + req.body.token);
		console.log('loc: ' + req.body.loc);
		console.log('location: ' + req.body.location);

		if (!req.body.hasOwnProperty('token')) {
			res.json(true);
		}

		if (!(req.body.hasOwnProperty('loc') || req.body.hasOwnProperty('location'))) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		var token = req.body.token;
		var loc = req.body.loc;
		if (req.body.location) {
			loc = [req.body.location.latitude, req.body.location.longitude];
		}
		var objectid = req.body.objectid;
		var objectdetails = req.body.objectdetails;

		TimesheetService.saveCrumble(token, loc, objectid, objectdetails).then(function () {
			res.json(true);
		}).fail(function (err) {
			console.log('err: ' + err);
			res.statusCode = 401;
			return res.send('Error 401: Invalid token.');
		});
	});
};