module.exports = function(app) {
	app.get('/', function(request, response, next) {
		response.render('index');
	});

	require('./entrystore')(app);
	// other routes entered here as require(route)(app);
	// we basically pass 'app' around to each route
}