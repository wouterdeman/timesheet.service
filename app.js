'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var app = express();
var port = 3000;

/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

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
    app.set('views', __dirname + '/dist/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');

// Set bodyParser
app.use(express.bodyParser());

/*
 * Sample Data
 */
var entries = [
    { type: 'locationinfo', userinfo: { latitude: '51.227152', longitude: '4.403433', deviceid: 'HT9CTP820988', devicetype: 'android'}}
];

/*
 * Routes
 */
// Index Page
app.get('/', function(request, response, next) {
    response.render('index');
});

app.get('/entries', function(req, res) {    
  res.json(entries);
});

app.get('/entry/random', function(req, res) {
  var id = Math.floor(Math.random() * entries.length);
  var q = entries[id];
  res.json(q);
});

app.get('/entry/:id', function(req, res) {
  if(entries.length <= req.params.id || req.params.id < 0) {
    res.statusCode = 404;
    return res.send('Error 404: No entry found');
  }

  var q = entries[req.params.id];
  res.json(q);
});

app.post('/entry', function(req, res) {
    console.log(req.body);
  if(!req.body.hasOwnProperty('type') || 
     !req.body.hasOwnProperty('userinfo')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  }

  var newEntry = {
    type : req.body.type,
    userinfo : req.body.userinfo
  };

  entries.push(newEntry);
  res.json(true);
});

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);