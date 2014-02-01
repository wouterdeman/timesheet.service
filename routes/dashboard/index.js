module.exports = function(app) {
	var models = require('../../models/');
	var Entry = models.entryModel;

	app.get('/dashboard/last10', function(req, res) {
		Entry.getLast10(function(err, entries){
			if(err){
				res.json(err);
				return;
			}	
			res.json(entries);
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