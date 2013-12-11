module.exports = function(app) {
	app.get('/', ensureAuthenticated, function(req, res) {
		res.render('index', { user: req.user });
	});

	app.get('/login', function(req, res){
    	res.render('logon', { user: req.user, errorMessage: req.errorMessage });
	}); 

	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/login');
	});

	require('./entrystore')(app);
	require('./location')(app);
	require('./customer')(app);
	// other routes entered here as require(route)(app);
	// we basically pass 'app' around to each route

	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { 
			return next(); }
		res.redirect('/login')
	}

}