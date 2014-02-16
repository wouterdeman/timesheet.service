'use strict';

module.exports = function (app) {
	var geoUtils = require('geojson-utils');

	app.get('/location/diff', function (req, res) {
		console.log(req.query);
		var point1 = req.query.loc1;
		var point2 = req.query.loc2;
		//https://npmjs.org/package/geojson-utils returns distance in meters
		var distance = geoUtils.pointDistance({
			type: 'Point',
			coordinates: [point1.latitude, point1.longitude]
		}, {
			type: 'Point',
			coordinates: [point2.latitude, point2.longitude]
		});
		res.json(distance / 1000);
	});
};