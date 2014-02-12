module.exports = function(app) {
	var models = require('../../models/');
	var Customer = models.customerModel;

	app.get('/customer/generateTestData', function(req, res) {
		Customer.deleteAll();
		var testData = [{
			name: "SD",
			loc: [51.226956, 4.401744]

		}, {
			name: "ACERTA",
			loc: [50.882657, 4.713809]
		}];
		testData.forEach(function(testData) {
			Customer.save(testData);
		});

		res.json(testData);
	});

	app.get('/customer/getAll', function(req, res) {
		Customer.getAll(function(err, customers) {
			if (err) {
				res.json(err);
				return;
			}
			res.json(customers);
		})
	});

	app.get('/customer/nearest', function(req, res) {
		var point = req.query.loc;
		var coords = [point.latitude, point.longitude];
		Customer.getNearest(coords, function(err, customers) {
			res.json(customers);
		});
	});
};