'use strict';

module.exports = function (app) {
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	}

	app.get('/', ensureAuthenticated, function (req, res) {
		res.render('index', {
			user: req.user
		});
	});

	app.get('/login', function (req, res) {
		res.render('logon', {
			user: req.user,
			errorMessage: req.errorMessage
		});
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/login');
	});

	// Registering other routes
	require('./entrystore')(app);
	require('./zone')(app);
	require('./customer')(app);
	require('./dashboard')(app);
	require('./auth')(app);
};