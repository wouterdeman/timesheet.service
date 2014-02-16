'use strict';

module.exports = function (app) {
	var models = require('../../models');
	var Entry = models.entryModel;
	var User = models.userModel;

	app.post('/entry', function (req, res) {
		if (!req.body.hasOwnProperty('type') || !req.body.hasOwnProperty('userinfo') || !req.body.hasOwnProperty('token')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');

		var token = req.body.token;
		User.findOne({
			'token.token': token
		}, function (error, user) {
			if (!user) {
				res.json(false);
				return;
			}

			var newEntry = {
				type: req.body.type,
				userinfo: req.body.userinfo,
				loc: req.body.loc,
				user: user._id
			};

			Entry.save(newEntry);
			res.json(true);
		});
		res.json(false);
	});
};