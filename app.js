'use strict';

var db = require('./mongoose');
var express = require('express');
var app = express();
var port = 3000;

require('./express')(app, express, __dirname);
require('./passport')(app);
require('./routes')(app);

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);