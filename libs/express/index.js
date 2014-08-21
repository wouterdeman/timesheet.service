'use strict';

var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorhandler = require('errorhandler');
var session = require('express-session');

module.exports = function (app, express, rootDir) {
	/*
	 * Use Handlebars for templating
	 */
	var exphbs = require('express3-handlebars');

	// For gzip compression
	app.use(compression());

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
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(session({
		secret: 'veryverysecret',
		saveUninitialized: true,
		resave: true
	}));
	app.use(errorhandler({
		dumpExceptions: true,
		showStack: true
	}));

	//CORS middleware
	var allowCrossDomain = function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type');

		next();
	};
	app.use(allowCrossDomain);
};