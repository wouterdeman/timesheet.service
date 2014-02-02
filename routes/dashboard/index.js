module.exports = function(app) {
	var models = require('../../models/');
	var Entry = models.entryModel;
	var _ = require('lodash-node');

	app.get('/dashboard/last10', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		Entry.getLast10(function(err, entries){
			if(err){
				res.json(err);
				return;
			}	
			var result = _.map(entries, function(entry) { 
				return { 
					loc: entry.loc,
					user: entry.user.name,
					time: entry.updated
				 };
			});

			res.json(result);
		})
	});

	app.get('/dashboard/count', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		Entry.count(function(err, count){
			if(err){
				res.json(err);
				return;
			}			

			res.json(count);
		})
	});

	app.get('/dashboard/uniquelocations', function(req, res) {
		Entry.getUniqueLocations(function(err, entries){
			if(err){
				res.json(err);
				return;
			}	
			res.json(entries);
		})
	});
};