'use strict';

module.exports = function (app, express, rootDir) {
	/*
	 * Use Handlebars for templating
	 */
	var exphbs = require('express3-handlebars');

	// For gzip compression
	app.use(express.compress());

	/*
	 * Config for Production and Development
	 */
	if (process.env.NODE_ENV === 'production') {
		// Set the default layout and locate layouts and partials
		app.engine('handlebars', exphbs({
			defaultLayout: 'main',
			layoutsDir: 'dist/views/layouts/',
			partialsDir: 'dist/views/partials/'
		}));

		// Locate the views
		app.set('views', rootDir + '/dist/views');

		// Locate the assets
		app.use(express.static(rootDir + '/dist/assets'));

	} else {
		app.engine('handlebars', exphbs({
			// Default Layout and locate layouts and partials
			defaultLayout: 'main',
			layoutsDir: 'views/layouts/',
			partialsDir: 'views/partials/'
		}));

		// Locate the views
		app.set('views', rootDir + '/views');

		// Locate the assets
		app.use(express.static(rootDir + '/assets'));
	}

	// Set Handlebars
	app.set('view engine', 'handlebars');

	// Set bodyParser
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'veryverysecret'
	}));
};