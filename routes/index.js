'use strict';

module.exports = function (app) {
	// Registering other routes
	require('./entrystore')(app);
	require('./zone')(app);
	require('./customer')(app);
	require('./dashboard')(app);
	require('./auth')(app);
};