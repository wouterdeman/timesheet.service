module.exports = function(app) {
	var testdata = require('../../testdata');
	var entries = testdata.entries;
	var dummyEntry = testdata.dummyEntry;

	var models = require('../../models');
	var Entry = models.entryModel;

	app.get('/entries', function(req, res) {
		res.json(entries);
	});

	app.get('/entry/test', function(req, res) {
		Entry.save(dummyEntry);
		res.json(true);
	});

	app.get('/entry/random', function(req, res) {
		var id = Math.floor(Math.random() * entries.length);
		var q = entries[id];
		res.json(q);
	});

	app.get('/entry/:id', function(req, res) {
		if (entries.length <= req.params.id || req.params.id < 0) {
			res.statusCode = 404;
			return res.send('Error 404: No entry found');
		}

		var q = entries[req.params.id];
		res.json(q);
	});

	app.post('/entry', function(req, res) {
		console.log(req.body);
		if (!req.body.hasOwnProperty('type') || !req.body.hasOwnProperty('userinfo')) {
			res.statusCode = 400;
			return res.send('Error 400: Post syntax incorrect.');
		}

		var newEntry = {
			type: req.body.type,
			userinfo: req.body.userinfo
		};

		entries.push(newEntry);
		res.json(true);
	});
}